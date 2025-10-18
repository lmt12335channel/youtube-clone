import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { workflow } from "@/lib/workflow";
import { appURL, TRPC_ERROR_MESSAGES } from "@/constants";
import { utapi } from "@/lib/uploadthing-server";
import { max } from "@/lib/max";

export const videosRouter = createTRPCRouter({
  // TẠO VIDEO MỚI
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await max.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [{
          generated_subtitles: [{
            name: "English",
            language_code: "en",
          }]
        }]
      },
      cors_origin: appURL,
    });

    if (!upload.id || !upload.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: TRPC_ERROR_MESSAGES.MUX_UPLOAD_FAILED,
      });
    }

    const [createdVideo] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxUploadId: upload.id,
        muxStatus: "preparing",
      })
      .returning();

    if (!createdVideo) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: TRPC_ERROR_MESSAGES.DB_CREATE_FAILED,
      });
    }

    return { ...createdVideo, uploadUrl: upload.url };
  }),

  // LẤY THÔNG TIN CHI TIẾT 1 VIDEO
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { clerkUserId } = ctx;
      let user;
      if (clerkUserId) {
        user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkUserId),
        });
      }
      const userId = user?.id;

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({ creatorId: subscriptions.creatorId })
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      const [video] = await db
        .with(viewerSubscriptions, viewerReactions)
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          viewCount:
            sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"),
          likeCount:
            sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"),
          dislikeCount:
            sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'dislike')`.as("dislike_count"),
          subscriberCount:
            sql<number>`(SELECT COUNT(*) FROM ${subscriptions} WHERE ${subscriptions.creatorId} = ${videos.userId})`.as("sub_count"),
          isSubscribed: sql<boolean>`EXISTS(SELECT 1 FROM viewer_subscriptions WHERE viewer_subscriptions.creator_id = ${videos.userId})`.mapWith(Boolean).as("is_subscribed"),
          viewerReaction: viewerReactions.type,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(
          viewerReactions,
          eq(videos.id, viewerReactions.videoId)
        )
        .where(eq(videos.id, input.id));

      if (!video) throw new TRPCError({ code: "NOT_FOUND" });
      
      return video;
    }),
  
  // LẤY DANH SÁCH VIDEO (CHO TRANG CHỦ, TÌM KIẾM,...)
  getMany: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
        categoryId: z.string().uuid().nullish(),
        userId: z.string().uuid().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, categoryId, userId } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          viewCount:
            sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as(
              "view_count"
            ),
          likeCount:
            sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as(
              "like_count"
            ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            userId ? eq(videos.userId, userId) : undefined,
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem) {
          nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
        }
      }

      const processedData = data.map((item) => ({
        ...item,
        dislikeCount: 0, 
      }));

      return { items: processedData, nextCursor };
    }),

  // LẤY VIDEO THỊNH HÀNH
  getManyTrending: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ viewCount: z.number(), id: z.string().uuid() }).nullish(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor } = input;
      const viewCountSubquery = db.$with("view_count_subquery").as(
        db.select({
            videoId: videoViews.videoId,
            count: count(videoViews.videoId).as("count")
        }).from(videoViews).groupBy(videoViews.videoId)
      );

      const data = await db
        .with(viewCountSubquery)
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          viewCount: viewCountSubquery.count,
          likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewCountSubquery, eq(videos.id, viewCountSubquery.videoId))
        .where(
            and(
                eq(videos.visibility, "public"),
                cursor
                ? or(
                    lt(sql`${viewCountSubquery.count}`, cursor.viewCount),
                    and(
                        eq(sql`${viewCountSubquery.count}`, cursor.viewCount),
                        lt(videos.id, cursor.id)
                    )
                    )
                : undefined
            )
        )
        .orderBy(desc(sql`${viewCountSubquery.count}`), desc(videos.id))
        .limit(limit + 1);

        let nextCursor: typeof cursor | undefined = undefined;
        if (data.length > limit) {
          const nextItem = data.pop();
          if (nextItem) {
            nextCursor = { id: nextItem.id, viewCount: nextItem.viewCount ?? 0 };
          }
        }
        
        const processedData = data.map((item) => ({...item, dislikeCount: 0 }));

        return { items: processedData, nextCursor };
    }),

  // LẤY VIDEO TỪ KÊNH ĐÃ ĐĂNG KÝ
getManySubscribed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db.select({ creatorId: subscriptions.creatorId }).from(subscriptions).where(eq(subscriptions.viewerId, userId))
      );

      const data = await db
        .with(viewerSubscriptions)
        .select({
            ...getTableColumns(videos),
            user: getTableColumns(users),
            viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"),
            likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerSubscriptions, eq(videos.userId, viewerSubscriptions.creatorId))
        .where(
            and(
                eq(videos.visibility, "public"),
                cursor
                ? or(
                    lt(videos.updatedAt, cursor.updatedAt),
                    and(
                        eq(videos.updatedAt, cursor.updatedAt),
                        lt(videos.id, cursor.id)
                    )
                    )
                : undefined
            )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

        let nextCursor: typeof cursor | undefined = undefined;
        if (data.length > limit) {
          const nextItem = data.pop();
          if (nextItem) {
            nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
          }
        }

        const processedData = data.map((item) => ({ ...item, dislikeCount: 0 }));
        
        return { items: processedData, nextCursor };
    }),

// CÁC MUTATION
  update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const { id: videoId, ...valuesToUpdate } = input;
    const [updatedVideo] = await db.update(videos).set({
      ...valuesToUpdate,
      updatedAt: new Date(),
    }).where(and(eq(videos.id, videoId!), eq(videos.userId, userId))).returning();
    if (!updatedVideo) throw new TRPCError({ code: "NOT_FOUND" });
    return updatedVideo;
  }),

  remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const [video] = await db.select().from(videos).where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
    if (!video) throw new TRPCError({ code: "NOT_FOUND" });

    // Xóa asset trên Mux
    if (video.muxAssetId) await max.video.assets.delete(video.muxAssetId);

    // Xóa file trên UploadThing
    const keysToDelete = [video.thumbnailKey, video.previewKey].filter(Boolean) as string[];
    if (keysToDelete.length > 0) await utapi.deleteFiles(keysToDelete);
    
    // Xóa record trong DB
    await db.delete(videos).where(eq(videos.id, input.id));
    return { success: true };
  }),

  revalidate: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: videoId } = input;
    const { id: userId } = ctx.user;

    const [existingVideo] = await db.select().from(videos).where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });
    if (!existingVideo.muxUploadId) throw new TRPCError({ code: "BAD_REQUEST" });

    const upload = await max.video.uploads.retrieve(existingVideo.muxUploadId);
    if (!upload.asset_id) throw new TRPCError({ code: "BAD_REQUEST", message: "Asset not created yet." });

    const asset = await max.video.assets.retrieve(upload.asset_id);
    if (!asset) throw new TRPCError({ code: "BAD_REQUEST" });

    const playbackId = asset.playback_ids?.[0]?.id;
    const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

    const [updatedVideo] = await db
      .update(videos)
      .set({
        muxStatus: asset.status,
        muxPlaybackId: playbackId,
        muxAssetId: asset.id,
        duration,
      })
      .where(eq(videos.id, videoId))
      .returning();

    return updatedVideo;
  }),

  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await workflow.trigger({
        url: `${process.env.BASE_URL}/api/videos/workflows/title`,
        body: {
          videoId: input.id,
          userId: ctx.user.id,
        },
      });
    }),
    

  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await workflow.trigger({
        url: `${process.env.BASE_URL}/api/videos/workflows/description`,
        body: {
          videoId: input.id,
          userId: ctx.user.id,
        },
      });
    }),
    
  restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: videoId } = input;
    const { id: userId } = ctx.user;

    const [existingVideo] = await db.select().from(videos).where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

    // Xóa thumbnail tùy chỉnh cũ trên UploadThing (nếu có)
    if (existingVideo.thumbnailKey) {
      await utapi.deleteFiles(existingVideo.thumbnailKey);
    }
    if (!existingVideo.muxPlaybackId) throw new TRPCError({ code: "BAD_REQUEST" });

    // Lấy thumbnail mặc định từ Mux và upload lên UploadThing
    const tempThumbnailURL = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
    const { data } = await utapi.uploadFilesFromUrl(tempThumbnailURL);
    if (!data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to restore thumbnail." });

    // Cập nhật lại DB
    const [updatedVideo] = await db
      .update(videos)
      .set({ thumbnailUrl: data.url, thumbnailKey: data.key })
      .where(eq(videos.id, videoId))
      .returning();

    return updatedVideo;
  }),
  generateThumbnail: protectedProcedure
    .input(z.object({
      videoId: z.string().uuid(),
      prompt: z.string().min(10)
    }))
    .mutation(async ({ ctx, input }) => {
      await workflow.trigger({
        url: `${process.env.BASE_URL}/api/videos/workflows/thumbnail`,
        body: {
          videoId: input.videoId,
          prompt: input.prompt,
          userId: ctx.user.id,
        },
      });
    }),
});