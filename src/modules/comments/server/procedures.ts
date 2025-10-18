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
import { commentReactions, comments, users } from "@/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/trpc/init";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        value: z.string().min(1),
        parentId: z.string().uuid().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, parentId, value } = input;
      const { id: userId } = ctx.user;

      if (parentId) {
        const existingComment = await db.query.comments.findFirst({
          where: (comment) => eq(comment.id, parentId),
          columns: {
            parentId: true,
          },
        });
        if (existingComment?.parentId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot reply to a reply.",
          });
        }
      }

      const [createdComment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          parentId,
          value,
        })
        .returning();

      return createdComment;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { videoId, parentId, limit, cursor } = input;
      const { clerkUserId } = ctx;

      let user;
      if (clerkUserId) {
        user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkUserId),
        });
      }
      const userId = user?.id;

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );
      
      const data = await db
        .with(replies, viewerReactions)
        .select({
          // Thay vì dùng ...db.query... không an toàn, hãy select trực tiếp
          comment: getTableColumns(comments),
          user: getTableColumns(users),
          likeCount: sql<number>`(SELECT COUNT(*) FROM ${commentReactions} WHERE ${commentReactions.commentId} = ${comments.id} AND ${commentReactions.type} = 'like')`.as("like_count"),
          dislikeCount: sql<number>`(SELECT COUNT(*) FROM ${commentReactions} WHERE ${commentReactions.commentId} = ${comments.id} AND ${commentReactions.type} = 'dislike')`.as("dislike_count"),
          replyCount: sql<number>`${replies.count}`.as("reply_count"),
          viewerReaction: viewerReactions.type,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(replies, eq(comments.id, replies.parentId))
        .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1);
      
      // Chuyển đổi cấu trúc dữ liệu để dễ sử dụng ở client
      const processedData = data.map(item => ({
        ...item.comment,
        user: item.user,
        likeCount: item.likeCount,
        dislikeCount: item.dislikeCount,
        replyCount: item.replyCount ?? 0, // Mặc định là 0 nếu null
        viewerReaction: item.viewerReaction,
      }));

      let nextCursor: typeof cursor | undefined = undefined;
      if (processedData.length > limit) {
        const nextItem = processedData.pop();
        if (nextItem) {
          nextCursor = { id: nextItem.id, updatedAt: nextItem.updatedAt };
        }
      }
      
      const totalCountQuery = await db
        .select({ count: count(comments.id) })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId)
          )
        );

      const totalCount = totalCountQuery[0]?.count ?? 0;
      
      return { items: processedData, nextCursor, totalCount };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: commentId } = input;
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found or you do not have permission to delete it.",
        });
      }
      
      return deletedComment;
    }),
});