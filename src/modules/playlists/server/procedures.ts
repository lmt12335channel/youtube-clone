import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, inArray, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { playlists, playlist_videos, users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const playlistsRouter = createTRPCRouter({
  // TẠO PLAYLIST MỚI
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [createdPlaylist] = await db.insert(playlists).values({ userId, name: input.name }).returning();
      return createdPlaylist;
    }),

  // XÓA PLAYLIST
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: playlistId } = input;
      const { id: userId } = ctx.user;
      const [deleted] = await db.delete(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId))).returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
      return deleted;
    }),

  // LẤY DANH SÁCH PLAYLIST CỦA NGƯỜD DÙNG
  getMany: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;
      const data = await db.select({
          ...getTableColumns(playlists),
          videoCount: sql<number>`(SELECT COUNT(*) FROM ${playlist_videos} WHERE ${playlist_videos.playlistId} = ${playlists.id})`.as("video_count"),
          thumbnailUrl: sql<string | null>`(SELECT ${videos.thumbnailUrl} FROM ${playlist_videos} JOIN ${videos} ON ${videos.id} = ${playlist_videos.videoId} WHERE ${playlist_videos.playlistId} = ${playlists.id} ORDER BY ${playlist_videos.createdAt} DESC LIMIT 1)`.as("thumbnail_url"),
        }).from(playlists).where(and(eq(playlists.userId, userId), cursor ? or(lt(playlists.updatedAt, cursor.updatedAt), and(eq(playlists.updatedAt, cursor.updatedAt), lt(playlists.id, cursor.id))) : undefined))
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem) {
          nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
        }
      }
      return { items: data, nextCursor };
    }),

  // LẤY THÔNG TIN CHI TIẾT 1 PLAYLIST
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [playlist] = await db.select().from(playlists).where(and(eq(playlists.id, input.id), eq(playlists.userId, userId)));
      if (!playlist) throw new TRPCError({ code: "NOT_FOUND" });
      return playlist;
    }),

  // LẤY LỊCH SỬ XEM
  getHistory: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ viewedAt: z.date(), id: z.string().uuid() }).nullish(),
      }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;
      const viewerVideoViews = db.$with("viewer_video_views").as(db.select({ videoId: videoViews.videoId, viewedAt: videoViews.updatedAt }).from(videoViews).where(eq(videoViews.userId, userId)));
      const data = await db.with(viewerVideoViews).select({ ...getTableColumns(videos), user: getTableColumns(users), viewedAt: viewerVideoViews.viewedAt, viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"), likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"), dislikeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'dislike')`.as("dislike_count") }).from(videos).innerJoin(users, eq(videos.userId, users.id)).innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId)).where(cursor ? or(lt(viewerVideoViews.viewedAt, cursor.viewedAt), and(eq(viewerVideoViews.viewedAt, cursor.viewedAt), lt(videos.id, cursor.id))) : undefined).orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id)).limit(limit + 1);
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem) nextCursor = { id: nextItem.id, viewedAt: nextItem.viewedAt! };
      }
      return { items: data, nextCursor };
    }),
  
  // LẤY VIDEO ĐÃ THÍCH
  getLiked: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ likedAt: z.date(), id: z.string().uuid() }).nullish(),
      }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;
      const viewerVideoReactions = db.$with("viewer_video_reactions").as(db.select({ videoId: videoReactions.videoId, likedAt: videoReactions.updatedAt }).from(videoReactions).where(and(eq(videoReactions.userId, userId), eq(videoReactions.type, "like"))));
      const data = await db.with(viewerVideoReactions).select({ ...getTableColumns(videos), user: getTableColumns(users), likedAt: viewerVideoReactions.likedAt, viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"), likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"), dislikeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'dislike')`.as("dislike_count") }).from(videos).innerJoin(users, eq(videos.userId, users.id)).innerJoin(viewerVideoReactions, eq(videos.id, viewerVideoReactions.videoId)).where(cursor ? or(lt(viewerVideoReactions.likedAt, cursor.likedAt), and(eq(viewerVideoReactions.likedAt, cursor.likedAt), lt(videos.id, cursor.id))) : undefined).orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id)).limit(limit + 1);
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem) nextCursor = { id: nextItem.id, likedAt: nextItem.likedAt! };
      }
      return { items: data, nextCursor };
    }),

  // LẤY DANH SÁCH VIDEO TRONG 1 PLAYLIST
  getVideos: protectedProcedure
    .input(z.object({
        playlistId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
      }))
    .query(async ({ ctx, input }) => {
      const { playlistId, limit, cursor } = input;
      const { id: userId } = ctx.user;
      const [playlist] = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
      if (!playlist) throw new TRPCError({ code: "NOT_FOUND" });
      const videosFromPlaylist = db.$with("videos_from_playlist").as(db.select({ videoId: playlist_videos.videoId }).from(playlist_videos).where(eq(playlist_videos.playlistId, playlistId)));
      const data = await db.with(videosFromPlaylist).select({ ...getTableColumns(videos), user: getTableColumns(users), viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"), likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"), dislikeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'dislike')`.as("dislike_count") }).from(videos).innerJoin(users, eq(videos.userId, users.id)).innerJoin(videosFromPlaylist, eq(videos.id, videosFromPlaylist.videoId)).where(cursor ? or(lt(videos.updatedAt, cursor.updatedAt), and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))) : undefined).orderBy(desc(videos.updatedAt), desc(videos.id)).limit(limit + 1);
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem) nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
      }
      return { items: data, nextCursor };
    }),

  // LẤY DANH SÁCH PLAYLIST CHO MODAL "ADD TO PLAYLIST"
  getManyForVideo: protectedProcedure
    .input(z.object({
        videoId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
      }))
    .query(async ({ ctx, input }) => {
      const { videoId, limit, cursor } = input;
      const { id: userId } = ctx.user;
      const data = await db.select({ ...getTableColumns(playlists), containsVideo: sql<boolean>`EXISTS(SELECT 1 FROM ${playlist_videos} WHERE ${playlist_videos.playlistId} = ${playlists.id} AND ${playlist_videos.videoId} = ${videoId})`.mapWith(Boolean).as("contains_video") }).from(playlists).where(and(eq(playlists.userId, userId), cursor ? or(lt(playlists.updatedAt, cursor.updatedAt), and(eq(playlists.updatedAt, cursor.updatedAt), lt(playlists.id, cursor.id))) : undefined)).orderBy(desc(playlists.updatedAt), desc(playlists.id)).limit(limit + 1);
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextItem = data.pop();
        if(nextItem) nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
      }
      return { items: data, nextCursor };
    }),

  // THÊM VIDEO VÀO PLAYLIST
  addVideo: protectedProcedure.input(z.object({ playlistId: z.string().uuid(), videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;
      const [playlist] = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
      if (!playlist) throw new TRPCError({ code: "FORBIDDEN" });
      const [existing] = await db.select().from(playlist_videos).where(and(eq(playlist_videos.playlistId, playlistId), eq(playlist_videos.videoId, videoId)));
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Video already in playlist." });
      const [result] = await db.insert(playlist_videos).values({ playlistId, videoId }).returning();
      return result;
    }),

  // XÓA VIDEO KHỎI PLAYLIST
  removeVideo: protectedProcedure.input(z.object({ playlistId: z.string().uuid(), videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const { playlistId, videoId } = input;
      const { id: userId } = ctx.user;
      const [playlist] = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
      if (!playlist) throw new TRPCError({ code: "FORBIDDEN" });
      const [deleted] = await db.delete(playlist_videos).where(and(eq(playlist_videos.playlistId, playlistId), eq(playlist_videos.videoId, videoId))).returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
      return deleted;
    }),
});