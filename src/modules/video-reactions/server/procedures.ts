import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [existingReaction] = await db.select().from(videoReactions)
        .where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)));

      if (existingReaction && existingReaction.type === "like") {
        // Nếu đã like, xóa reaction đi
        const [deleted] = await db.delete(videoReactions).where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId))).returning();
        return { status: "removed", reaction: deleted };
      }

      // Nếu chưa có reaction, hoặc đã dislike, thì upsert (thêm mới hoặc cập nhật) thành 'like'
      const [result] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "like" })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "like" },
        })
        .returning();
      
      return { status: "added", reaction: result };
    }),

  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      
      const [existingReaction] = await db.select().from(videoReactions).where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)));

      if (existingReaction && existingReaction.type === "dislike") {
        // Nếu đã dislike, xóa reaction đi
        const [deleted] = await db.delete(videoReactions).where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId))).returning();
        return { status: "removed", reaction: deleted };
      }

      // Upsert thành 'dislike'
      const [result] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "dislike" })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "dislike" },
        })
        .returning();

      return { status: "added", reaction: result };
    }),
});