"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Link from "next/link";
import { format } from "date-fns";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { snakeCaseToTitle } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";

// --- Skeleton ---
const VideosSectionSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-20 w-36 rounded-lg" />
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Component Logic ---
const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.pages.flatMap((page) =>
            page.items.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <Link
                    href={`/studio/videos/${video.id}`}
                    className="flex items-start gap-4"
                  >
                    <div className="relative aspect-video w-36 shrink-0">
                      <VideoThumbnail
                        thumbnailUrl={video.thumbnailUrl}
                        previewUrl={video.previewUrl}
                        duration={video.duration}
                        title={video.title}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="line-clamp-2 font-semibold">{video.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {video.description || "No description."}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{video.visibility}</TableCell>
                <TableCell>
                  {format(new Date(video.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{video.viewCount}</TableCell>
                <TableCell>{video.commentCount}</TableCell>
                <TableCell>{video.likeCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <InfiniteScroll
        hasMore={query.hasNextPage}
        isLoading={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

// --- Component Chính ---
export const VideosSection = () => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải danh sách video.</p>}>
      <Suspense fallback={<VideosSectionSkeleton />}>
        <VideosSectionSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};