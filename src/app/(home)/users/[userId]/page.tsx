import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { UserView } from "@/modules/users/ui/views/user-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    userId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { userId } = params;

  // Tải trước thông tin chi tiết của người dùng
  void trpc.users.getOne.prefetch({ id: userId });

  // Tải trước trang đầu tiên trong danh sách video của người dùng đó
  void trpc.videos.getMany.prefetchInfinite({
    userId: userId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
}