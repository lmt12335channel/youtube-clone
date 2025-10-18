"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

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

// --- Props ---
interface VideosSectionProps {
  playlistId: string;
}

// --- Skeleton ---
const VideosSectionSkeleton = () => {
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
const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    {
      playlistId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  const { mutate } = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      void utils.playlists.getVideos.invalidate({ playlistId });
      void utils.playlists.getMany.invalidate(); // Để cập nhật videoCount
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  return (
    <>
      {/* Giao diện Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              size="compact"
              onRemove={() => mutate({ playlistId, videoId: video.id })}
            />
          ))
        )}
      </div>

      {/* Giao diện Mobile */}
      <div className="flex flex-col gap-y-10 md:hidden">
        {videos.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() => mutate({ playlistId, videoId: video.id })}
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
export const VideosSection = (props: VideosSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải danh sách video.</p>}>
      <Suspense fallback={<VideosSectionSkeleton />}>
        <VideosSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};