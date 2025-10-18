"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration } from "@/lib/utils";
import { thumbnailFallback } from "@/modules/videos/constants";

// --- Props ---
interface VideoThumbnailProps {
  thumbnailUrl: string | null;
  previewUrl: string | null;
  duration: number;
  title: string;
}

// --- Skeleton ---
export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <Skeleton className="size-full" />
    </div>
  );
};

// --- Component Chính ---
export const VideoThumbnail = ({
  thumbnailUrl,
  previewUrl,
  duration,
  title,
}: VideoThumbnailProps) => {
  return (
    // 'group' cho phép các phần tử con phản ứng với sự kiện hover của phần tử cha
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl">
      {/* Ảnh GIF xem trước (chỉ hiển thị khi hover) */}
      <Image
        src={previewUrl ?? thumbnailFallback}
        alt={title}
        fill
        className="size-full object-cover opacity-0 transition-opacity group-hover:opacity-100"
        unoptimized // Quan trọng: giữ cho ảnh GIF hoạt động
      />
      {/* Ảnh thumbnail tĩnh (ẩn đi khi hover) */}
      <Image
        src={thumbnailUrl ?? thumbnailFallback}
        alt={title}
        fill
        className="size-full object-cover opacity-100 transition-opacity group-hover:opacity-0"
      />

      {/* Hộp hiển thị thời lượng video */}
      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {formatDuration(duration)}
      </div>
    </div>
  );
};