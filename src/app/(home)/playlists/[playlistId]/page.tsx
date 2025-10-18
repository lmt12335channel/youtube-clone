import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { VideosView } from "@/modules/playlists/ui/views/videos-view"; 

// Trang này cần được render động
export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        playlistId: string;
    };
}

export default async function Page({ params }: PageProps) {
    const { playlistId } = params;

    // Tải trước dữ liệu của playlist trên server
    // Sửa lại procedure và input cho đúng
    void trpc.playlists.getOne.prefetch({ id: playlistId });
    // Cũng nên prefetch cả danh sách video trong playlist
    void trpc.playlists.getVideos.prefetchInfinite({ playlistId });

    return (
        <HydrateClient>
            {/* Component chính hiển thị giao diện playlist */}
            <VideosView playlistId={playlistId} />
        </HydrateClient>
    );
};