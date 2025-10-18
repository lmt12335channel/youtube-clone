import { notFound } from "next/navigation";
import { HydrateClient, trpc } from "@/trpc/server";
import { WatchView } from "@/modules/videos/ui/views/video-view";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        videoId: string;
    };
}

const Page = async ({ params }: PageProps) => {
    const { videoId } = params;

    // Fetch dữ liệu trên server
    const data = await trpc.videos.getOne({ id: videoId });

    // Nếu không có dữ liệu (video private hoặc không tồn tại), hiển thị 404
    if (!data) {
        return notFound();
    }
    
    // Prefetch các dữ liệu khác nếu cần
    void trpc.videos.getRecommended.prefetch({ videoId });

    return (
        <HydrateClient>
            <WatchView videoId={videoId} />
        </HydrateClient>
    );
};

export default Page;