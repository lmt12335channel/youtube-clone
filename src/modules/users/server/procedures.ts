import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  eq,
  getTableColumns,
  inArray,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { subscriptions, users, videos } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
} from "@/trpc/init";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { clerkUserId } = ctx;
      let viewer;
      if (clerkUserId) {
        viewer = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkUserId),
        });
      }
      const viewerId = viewer?.id;

      // CTE để lấy danh sách các kênh mà người xem hiện tại đã đăng ký
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({ creatorId: subscriptions.creatorId })
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, viewerId ? [viewerId] : []))
      );

      // Truy vấn chính
      const [user] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(users),
          videoCount:
            sql<number>`(SELECT COUNT(*) FROM ${videos} WHERE ${videos.userId} = ${users.id})`.as("video_count"),
          subscriberCount:
            sql<number>`(SELECT COUNT(*) FROM ${subscriptions} WHERE ${subscriptions.creatorId} = ${users.id})`.as("sub_count"),
          isSubscribed: sql<boolean>`EXISTS(SELECT 1 FROM viewer_subscriptions WHERE viewer_subscriptions.creator_id = ${users.id})`.mapWith(Boolean).as("is_subscribed"),
        })
        .from(users)
        .where(eq(users.id, input.id));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user;
    }),
});