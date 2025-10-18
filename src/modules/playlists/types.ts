import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type PlaylistGetManyOutput = RouterOutput["playlists"]["getMany"];
export type PlaylistGetHistoryOutput = RouterOutput["playlists"]["getHistory"];
export type PlaylistGetLikedOutput = RouterOutput["playlists"]["getLiked"];
export type PlaylistGetVideosOutput = RouterOutput["playlists"]["getVideos"];