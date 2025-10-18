import { z } from "zod";
import { and, eq, getTableColumns, not, sql } from "drizzle-orm";

import { db } from "@/db";
import { users, videos, videoReactions, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const items = await db
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
            not(eq(videos.id, input.videoId))
          )
        )
        .orderBy(sql`random()`)
        .limit(input.limit);

      // Xử lý dữ liệu để khớp với kiểu dữ liệu mong đợi ở frontend
      const processedData = items.map((item) => ({
        ...item,
        dislikeCount: 0, // Không cần dislikeCount ở đây
      }));

      // Procedure này không cần phân trang, vì vậy nextCursor là undefined
      return { items: processedData, nextCursor: undefined };
    }),
});