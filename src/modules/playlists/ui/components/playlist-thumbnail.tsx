"use client";

import Image from "next/image";
import { ListVideoIcon } from "lucide-react";
import { thumbnailFallback } from "@/modules/videos/constants";

interface PlaylistThumbnailProps {
  thumbnailUrl: string | null;
  title: string;
  videoCount: number;
}

export const PlaylistThumbnail = ({
  thumbnailUrl,
  title,
  videoCount,
}: PlaylistThumbnailProps) => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl pt-3">
      {/* Lớp nền mờ thứ 2 */}
      <div className="absolute -top-1.5 left-1/2 w-[98.5%] -translate-x-1/2 overflow-hidden rounded-xl bg-black/25 aspect-video" />
      {/* Lớp nền mờ thứ 1 */}
      <div className="absolute -top-3 left-1/2 w-[97%] -translate-x-1/2 overflow-hidden rounded-xl bg-black/20 aspect-video" />
      
      {/* Ảnh chính và overlay */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnailUrl ?? thumbnailFallback}
          alt={title}
          fill
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="font-semibold text-white">PLAY ALL</p>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
          <ListVideoIcon className="size-4" />
          <span>{videoCount} videos</span>
        </div>
      </div>
    </div>
  );
};