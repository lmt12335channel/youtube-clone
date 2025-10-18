import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot subscribe to yourself." });
      }
      const [newSubscription] = await db.insert(subscriptions).values({ viewerId: ctx.user.id, creatorId: input.userId }).returning();
      return newSubscription;
    }),

  remove: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db.delete(subscriptions).where(and(eq(subscriptions.viewerId, ctx.user.id), eq(subscriptions.creatorId, input.userId))).returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
      return deleted;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.object({ createdAt: z.date(), creatorId: z.string().uuid() }).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          user: {
            ...getTableColumns(users),
            subscriberCount: sql<number>`(SELECT COUNT(*) FROM ${subscriptions} WHERE ${subscriptions.creatorId} = ${users.id})`.as("sub_count"),
          },
          ...getTableColumns(subscriptions),
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(eq(subscriptions.viewerId, userId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit + 1);
        
      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
          const nextItem = data.pop();
          if(nextItem) {
            nextCursor = { createdAt: nextItem.createdAt, creatorId: nextItem.creatorId };
          }
      }
      
      return { items: data, nextCursor };
    }),
});