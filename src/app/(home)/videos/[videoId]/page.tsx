import { HydrateClient } from '@/trpc/server';
import { trpc } from '@/trpc/server';
import { VideoView } from '@/modules/videos/ui/views/video-view';
import { DEFAULT_LIMIT } from '@/constants';

// Rất quan trọng: Báo cho Next.js đây là một trang động
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    videoId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { videoId } = params;

  /**
   * Tải trước (prefetch) tất cả dữ liệu cần thiết cho trang xem video.
   * Điều này giúp cải thiện đáng kể hiệu suất tải trang ban đầu.
   */
  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.suggestions
    .getMany
    .prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });
  void trpc.comments
    .getMany
    .prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}