// src/modules/videos/ui/components/video-info.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import { type VideoGetManyOutput } from "@/modules/videos/types";
import { formatCompactNumber } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(
    () => formatCompactNumber(data.viewCount),
    [data.viewCount]
  );
  const compactDate = useMemo(
    () => formatDistanceToNow(new Date(data.createdAt), { addSuffix: true }),
    [data.createdAt]
  );

  return (
    <div className="flex gap-3">
      <Link href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`}>
          <h3 className="break-words text-base font-medium line-clamp-2 lg:line-clamp-1">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className="line-clamp-1 text-sm text-gray-600">
            {compactViews} views &bull; {compactDate}
          </p>
        </Link>
      </div>

      <div className="shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  );
};