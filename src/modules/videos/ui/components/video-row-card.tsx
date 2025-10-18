"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, formatCompactNumber } from "@/lib/utils";
import { type VideoGetManyOutput } from "@/modules/videos/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoThumbnail } from "./video-thumbnail";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";

// --- CVA Variants ---
const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// --- Props ---
interface VideoRowCardProps
  extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

// --- Skeleton ---
export const VideoRowCardSkeleton = ({
  size,
}: VariantProps<typeof videoRowCardVariants>) => {
  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <Skeleton className={cn(thumbnailVariants({ size }), "aspect-video")} />
      <div className="flex flex-1 flex-col gap-y-1">
        <Skeleton className={cn("h-5 w-5/6", size === "compact" && "h-4")} />
        <Skeleton className={cn("h-4 w-2/3", size === "compact" && "h-3")} />
        <Skeleton className={cn("h-4 w-1/2", size === "compact" && "h-3")} />
      </div>
    </div>
  );
};

// --- Component ---
export const VideoRowCard = ({ data, size, onRemove }: VideoRowCardProps) => {
  const compactViews = useMemo(
    () => formatCompactNumber(data.viewCount),
    [data.viewCount]
  );
  const compactLikes = useMemo(
    () => formatCompactNumber(data.likeCount),
    [data.likeCount]
  );

  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <Link href={`/videos/${data.id}`} className={cn(thumbnailVariants({ size }))}>
        <VideoThumbnail
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          duration={data.duration}
          title={data.title}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>

            {/* Thông tin cho size compact */}
            {size === "compact" && (
              <>
                <UserInfo size="small" name={data.user.name} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {compactViews} views &bull; {compactLikes} likes
                </p>
              </>
            )}

            {/* Thông tin cho size default */}
            {size === "default" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {compactViews} views &bull; {compactLikes} likes
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
        
        {/* Render thông tin người dùng và mô tả chỉ cho size default */}
        {size === "default" && (
          <>
            <div className="my-3 flex items-center gap-2">
              <Link href={`/users/${data.user.id}`}>
                <UserAvatar
                  size="sm"
                  imageUrl={data.user.imageUrl}
                  name={data.user.name}
                />
              </Link>
              <UserInfo size="small" name={data.user.name} />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="w-fit text-xs text-muted-foreground line-clamp-2">
                    {data.description || "No description."}
                  </p>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-xs bg-black/70 text-white"
                >
                  {data.description || "No description."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
};