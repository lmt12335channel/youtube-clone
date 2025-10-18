"use client";

import Link from "next/link";
import { type VideoGetManyOutput } from "@/modules/videos/types";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoThumbnail } from "./video-thumbnail";
import { VideoInfo } from "./video-info";

// --- Props ---
interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

// --- Skeleton ---
export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
};

// --- Component ---
export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex w-full flex-col gap-2 group">
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          duration={data.duration}
          title={data.title}
        />
      </Link>

      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};