import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ id: z.string().uuid(), updatedAt: z.date() }).nullish(),
        categoryId: z.string().uuid().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { query, limit, cursor, categoryId } = input;

      const data = await db
        .select({
          video: getTableColumns(videos),
          user: getTableColumns(users),
          viewCount: sql<number>`(SELECT COUNT(*) FROM ${videoViews} WHERE ${videoViews.videoId} = ${videos.id})`.as("view_count"),
          likeCount: sql<number>`(SELECT COUNT(*) FROM ${videoReactions} WHERE ${videoReactions.videoId} = ${videos.id} AND ${videoReactions.type} = 'like')`.as("like_count"),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            query ? or(ilike(videos.title, `%${query}%`), ilike(users.name, `%${query}%`)) : undefined,
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
          nextCursor = { id: nextItem.video.id, updatedAt: nextItem.video.updatedAt };
        }
      }

      return { items: data, nextCursor };
    }),
});