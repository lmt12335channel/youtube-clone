import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { LikedView } from "@/modules/playlists/ui/views/liked-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.playlists.getLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
}