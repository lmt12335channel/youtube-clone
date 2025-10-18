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

interface ResultsSectionProps {
  query: string;
  categoryId?: string;
}

const ResultsSectionSkeleton = () => {
  const isMobile = useIsMobile();
  const skeletonCount = isMobile ? 5 : 8;

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: skeletonCount }).map((_, i) =>
        isMobile ? (
          <VideoGridCardSkeleton key={i} />
        ) : (
          <VideoRowCardSkeleton key={i} />
        )
      )}
    </div>
  );
};

const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();
  const [videos, tRPCQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query: query ?? "",
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) =>lastPage.nextCursor,
    }
  );

  return (
    <>
      {/* Giao diện Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages.flatMap((page) =>
          // Xử lý đúng cấu trúc dữ liệu lồng nhau
          page.items.map((result) => (
            <VideoRowCard
              key={result.video.id}
              data={{ 
                ...result.video, 
                user: result.user, 
                viewCount: result.viewCount, 
                likeCount: result.likeCount,
                dislikeCount: 0 
              }}
            />
          ))
        )}
      </div>

      {/* Giao diện Mobile */}
      <div className="flex flex-col gap-y-10 md:hidden">
        {videos.pages.flatMap((page) =>
          // Xử lý đúng cấu trúc dữ liệu lồng nhau
          page.items.map((result) => (
            <VideoGridCard
              key={result.video.id}
              data={{ 
                ...result.video, 
                user: result.user, 
                viewCount: result.viewCount, 
                likeCount: result.likeCount,
                dislikeCount: 0
              }}
            />
          ))
        )}
      </div>

      <InfiniteScroll
        hasMore={tRPCQuery.hasNextPage}
        isLoading={tRPCQuery.isFetchingNextPage}
        fetchNextPage={tRPCQuery.fetchNextPage}
      />
    </>
  );
};

export const ResultsSection = (props: ResultsSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải kết quả tìm kiếm.</p>}>
      <Suspense fallback={<ResultsSectionSkeleton />}>
        <ResultsSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};