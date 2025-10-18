"use client";

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { trpc } from '@/trpc/client';
import { DEFAULT_LIMIT } from '@/constants';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { VideoRowCard, VideoRowCardSkeleton } from '@/modules/videos/ui/components/video-row-card';
import { VideoGridCard, VideoGridCardSkeleton } from '@/modules/videos/ui/components/video-grid-card';

// --- Props ---
interface SuggestionsSectionProps {
  videoId: string;
}

// --- Skeleton ---
const SuggestionsSectionSkeleton = () => {
  const isMobile = useIsMobile();
  
  // Skeleton cho mobile (dạng grid)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-y-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <VideoGridCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  // Skeleton cho desktop (dạng row)
  return (
    <div className="flex flex-col gap-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <VideoRowCardSkeleton key={i} size="compact" />
      ))}
    </div>
  );
};

// --- Component Logic ---
const SuggestionsSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
  const isMobile = useIsMobile();
  const [suggestions] = trpc.suggestions.getMany.useSuspenseQuery({
      videoId,
      limit: DEFAULT_LIMIT,
  });

  return (
    <>
      {/* Giao diện Desktop */}
      <div className="hidden flex-col gap-3 md:flex">
        {suggestions.items.map((video) => (
          <VideoRowCard key={video.id} data={video} size="compact" />
        ))}
      </div>

      {/* Giao diện Mobile */}
      <div className="flex flex-col gap-10 md:hidden">
        {suggestions.items.map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>
    </>
  );
};

// --- Component Chính ---
export const SuggestionsSection = (props: SuggestionsSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Đã có lỗi xảy ra.</p>}>
      <Suspense fallback={<SuggestionsSectionSkeleton />}>
        <SuggestionsSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};