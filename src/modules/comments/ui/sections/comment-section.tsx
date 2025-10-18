"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "../components/comment-form";
import { CommentItem } from "../components/comment-item";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";

// --- Props ---
interface CommentSectionProps {
  videoId: string;
}

// --- Skeleton ---
const CommentSectionSkeleton = () => {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex flex-col gap-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-4">
        {/* Giả lập một vài comment item đang tải */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Component Logic ---
const CommentSectionSuspense = ({ videoId }: CommentSectionProps) => {
  const utils = trpc.useUtils();
  const [comments, query] =
    trpc.comments.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
      }
    );

  const totalComments = comments?.pages[0]?.totalCount ?? 0;
  const commentText = totalComments === 1 ? "comment" : "comments";

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">
          {totalComments} {commentText}
        </h2>
      </div>

      <CommentForm
        videoId={videoId}
        onSuccess={() => {
          // Làm mới lại danh sách bình luận sau khi thêm thành công
          void utils.comments.getMany.invalidate({ videoId });
        }}
      />

      <div className="flex flex-col gap-4">
        {comments.pages.flatMap((page) =>
          page.items.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      <InfiniteScroll
        hasMore={query.hasNextPage}
        isLoading={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};

// --- Component Chính ---
export const CommentSection = (props: CommentSectionProps) => {
  return (
    <ErrorBoundary
      fallback={<p>Đã có lỗi xảy ra khi tải bình luận.</p>}
    >
      <Suspense fallback={<CommentSectionSkeleton />}>
        <CommentSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};