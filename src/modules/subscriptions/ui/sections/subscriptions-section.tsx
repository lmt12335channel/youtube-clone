"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Link from "next/link";
import { toast } from "sonner";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { SubscriptionItem } from "../components/subscription-item";

// --- Skeleton ---
const SubscriptionsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
};

// --- Component Logic ---
const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  const { mutate: unsubscribe, isPending } = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      void utils.subscriptions.getMany.invalidate();
      // Invalidate các query khác nếu cần, ví dụ:
      void utils.videos.getOne.invalidate();
      void utils.users.getOne.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });
  
  const allSubscriptions = subscriptions.pages.flatMap((page) => page.items);

  if (allSubscriptions.length === 0) {
    return <p className="text-muted-foreground">You are not subscribed to any channels.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {allSubscriptions.map((sub) => (
          <Link href={`/users/${sub.user.id}`} key={sub.user.id}>
            <SubscriptionItem
              name={sub.user.name}
              imageUrl={sub.user.imageUrl}
              subscriberCount={sub.user.subscriberCount}
              onUnsubscribe={() => unsubscribe({ userId: sub.user.id })}
              disabled={isPending}
            />
          </Link>
        ))}
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
export const SubscriptionsSection = () => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải danh sách kênh đăng ký.</p>}>
      <Suspense fallback={<SubscriptionsSectionSkeleton />}>
        <SubscriptionsSectionSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};