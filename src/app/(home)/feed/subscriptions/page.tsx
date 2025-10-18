import { HydrateClient, trpc } from "@/trpc/server";
import { SubscribedView } from "@/modules/home/ui/views/subscribed-view"; // Sẽ tạo ở bước sau
import { DEFAULT_LIMIT } from "@/constants";

// Trang này cần được render động
export const dynamic = "force-dynamic";

const SubscriptionsPage = async () => {
    // Tải trước trang đầu tiên của danh sách video từ các kênh đã đăng ký
    void trpc.videos.getManySubscribed.prefetchInfinite({
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            {/* Component chính hiển thị giao diện trang đã đăng ký */}
            <SubscribedView />
        </HydrateClient>
    );
};

export default SubscriptionsPage;