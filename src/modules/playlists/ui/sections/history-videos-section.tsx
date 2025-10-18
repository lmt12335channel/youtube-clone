"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

// --- Skeleton ---
const HistoryVideosSectionSkeleton = () => {
  const isMobile = useIsMobile();
  const skeletonCount = isMobile ? 5 : 8;

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: skeletonCount }).map((_, i) =>
        isMobile ? (
          <VideoGridCardSkeleton key={i} />
        ) : (
          <VideoRowCardSkeleton key={i} size="compact" />
        )
      )}
    </div>
  );
};

// --- Component Logic ---
const HistoryVideosSectionSuspense = () => {
  const isMobile = useIsMobile();
  const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  return (
    <>
      {/* Giao diện Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))
        )}
      </div>

      {/* Giao diện Mobile */}
      <div className="flex flex-col gap-y-10 md:hidden">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard key={video.id} data={video} />
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

// --- Component Chính ---
export const HistoryVideosSection = () => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải lịch sử xem.</p>}>
      <Suspense fallback={<HistoryVideosSectionSkeleton />}>
        <HistoryVideosSectionSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};