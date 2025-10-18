import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type VideoGetOneOutput = RouterOutput["videos"]["getOne"];
export type VideoGetManyOutput = RouterOutput["suggestions"]["getMany"];
export type VideoGetManySubscribedOutput =
  RouterOutput["videos"]["getManySubscribed"];