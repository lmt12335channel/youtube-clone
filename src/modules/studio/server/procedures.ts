import { z } from "zod";
import { and, count, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { comments, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const studioRouter = createTRPCRouter({
  // Lấy danh sách video cho Studio Dashboard
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

      const data = await db
        .select({
          ...getTableColumns(videos),
          viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"),
          likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"),
          commentCount: sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.videoId} = ${videos.id})`.as("comment_count"),
        })
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
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

      return { items: data, nextCursor };
    }),

  // Lấy thông tin chi tiết 1 video cho trang chỉnh sửa
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      
      if (!video) {
        return null;
      }
      
      return video;
    }),
});