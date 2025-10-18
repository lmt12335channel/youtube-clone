"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "../components/video-player";
import { VideoTopRow } from "../components/video-top-row";
import { VideoDescription } from "../components/video-description";

// --- Props ---
interface VideoSectionProps {
  videoId: string;
}

// --- Skeleton ---
const VideoSectionSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="aspect-video w-full" />
    <div className="space-y-3">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

// --- Component Logic ---
const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  // Dùng useSuspenseQuery để lấy data đã được prefetch
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  return (
    <div className="flex flex-col">
      <VideoPlayer
        playbackId={video.muxPlaybackId}
        thumbnailUrl={video.thumbnailUrl}
        videoId={video.id}
      />
      <VideoTopRow video={video} />
      {/* VideoDescription đã được render bên trong VideoTopRow trong phiên bản cuối */}
    </div>
  );
};

// --- Component Chính ---
export const VideoSection = (props: VideoSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải video.</p>}>
      <Suspense fallback={<VideoSectionSkeleton />}>
        <VideoSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};