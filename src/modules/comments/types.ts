import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type CommentGetManyOutput = RouterOutput["comments"]["getMany"]["items"];