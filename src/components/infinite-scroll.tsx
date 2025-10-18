"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

// Đảm bảo interface này có đủ các props: hasMore, isLoading, fetchNextPage
interface InfiniteScrollProps {
  hasMore?: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
  isManual?: boolean;
}

export const InfiniteScroll = ({
  hasMore,
  isLoading,
  fetchNextPage,
  isManual = false,
}: InfiniteScrollProps) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isManual) {
      fetchNextPage();
    }
  }, [inView, hasMore, isLoading, isManual, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center p-4">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasMore) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div ref={ref} className="h-1" />
        {isManual && (
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={!hasMore || isLoading}
          >
            Load More
          </Button>
        )}
      </div>
    );
  }

  return (
    <p className="p-4 text-center text-sm text-muted-foreground">
      You have reached the end of the list.
    </p>
  );
};