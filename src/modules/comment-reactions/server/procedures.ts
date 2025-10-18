import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [existingReaction] = await db.select().from(commentReactions)
        .where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)));

      if (existingReaction && existingReaction.type === "like") {
        const [deleted] = await db.delete(commentReactions).where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId))).returning();
        return { status: "removed", reaction: deleted };
      }

      const [result] = await db.insert(commentReactions)
        .values({ userId, commentId, type: "like" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "like" },
        })
        .returning();
      
      return { status: "added", reaction: result };
    }),

  dislike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;
      
      const [existingReaction] = await db.select().from(commentReactions).where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)));

      if (existingReaction && existingReaction.type === "dislike") {
        const [deleted] = await db.delete(commentReactions).where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId))).returning();
        return { status: "removed", reaction: deleted };
      }

      const [result] = await db.insert(commentReactions)
        .values({ userId, commentId, type: "dislike" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "dislike" },
        })
        .returning();

      return { status: "added", reaction: result };
    }),
});