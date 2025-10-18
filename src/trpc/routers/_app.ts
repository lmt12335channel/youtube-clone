import { createTRPCRouter } from "@/trpc/init";
import { videosRouter } from "@/modules/videos/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { playlistsRouter } from "@/modules/playlists/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";

/**
 * Đây là router gốc của ứng dụng, hợp nhất tất cả các router con từ các module.
 */
export const appRouter = createTRPCRouter({
  videos: videosRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  studio: studioRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  subscriptions: subscriptionsRouter,
  playlists: playlistsRouter,
  categories: categoriesRouter,
  users: usersRouter,
  videoReactions: videoReactionsRouter,
  videoViews: videoViewsRouter,
});

// Export type của AppRouter để client có thể sử dụng.
export type AppRouter = typeof appRouter;