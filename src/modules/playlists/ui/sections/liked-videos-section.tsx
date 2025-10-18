"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

const LikedVideosSectionSuspense = () => {
  const [videos, query] = trpc.playlists.getLiked.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            // Sửa lại key ở đây, không có .video lồng nhau
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))
        )}
      </div>
      <InfiniteScroll
        hasMore={query.hasNextPage}
        isLoading={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export const LikedVideosSection = () => {
  return (
    <ErrorBoundary fallback={<p>Failed to load liked videos.</p>}>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <VideoRowCardSkeleton key={i} size="compact" />
            ))}
          </div>
        }
      >
        <LikedVideosSectionSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};