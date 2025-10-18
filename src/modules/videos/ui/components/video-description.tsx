"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

import { type VideoGetOneOutput } from "@/modules/videos/types";
import { formatCompactNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VideoDescriptionProps {
  video: VideoGetOneOutput;
}

export const VideoDescription = ({ video }: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const compactViews = useMemo(() => formatCompactNumber(video.viewCount), [video.viewCount]);
  const fullViews = useMemo(() => video.viewCount.toLocaleString(), [video.viewCount]);
  
  const compactDate = useMemo(() => formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }), [video.createdAt]);
  const fullDate = useMemo(() => format(new Date(video.createdAt), "MMM d, yyyy"), [video.createdAt]);

  return (
    <div
      className="cursor-pointer rounded-xl bg-muted p-3 transition hover:bg-muted/80"
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <div className="mb-2 flex gap-2 text-sm font-semibold">
        <span>{isExpanded ? fullViews : compactViews} views</span>
        <span>&bull;</span>
        <span>{isExpanded ? fullDate : compactDate}</span>
      </div>
      <p className={cn("text-sm", !isExpanded && "line-clamp-2 whitespace-pre-line")}>
        {video.description || "No description."}
      </p>
      {video.description && (
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
          {isExpanded ? (
            <>
              <ChevronUp className="size-4" /> Show less
            </>
          ) : (
            <>
              ...more
            </>
          )}
        </div>
      )}
    </div>
  );
};