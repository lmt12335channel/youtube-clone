"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

// --- Props ---
interface HomeVideosSectionProps {
  categoryId?: string;
}

// --- Skeleton ---
export const HomeVideosSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <VideoGridCardSkeleton key={i} />
      ))}
    </div>
  );
};

// --- Component Logic ---
const HomeVideosSectionSuspense = ({ categoryId }: HomeVideosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      categoryId,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
            />
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
export const HomeVideosSection = (props: HomeVideosSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải danh sách video.</p>}>
      <Suspense fallback={<HomeVideosSectionSkeleton />}>
        <HomeVideosSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
