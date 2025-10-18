import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Tải trước trang đầu tiên của danh sách playlist
  void trpc.playlists.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
}