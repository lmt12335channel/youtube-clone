import { HydrateClient, trpc } from "@/trpc/server";
import { TrendingView } from "@/modules/home/ui/views/trending-view"; // Sẽ tạo ở bước sau
import { DEFAULT_LIMIT } from "@/constants";

// Trang này cần được render động
export const dynamic = "force-dynamic";

const TrendingPage = async () => {
    // Tải trước trang đầu tiên của danh sách video thịnh hành
    void trpc.videos.getManyTrending.prefetchInfinite({
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            {/* Component chính hiển thị giao diện trang thịnh hành */}
            <TrendingView />
        </HydrateClient>
    );
};

export default TrendingPage;