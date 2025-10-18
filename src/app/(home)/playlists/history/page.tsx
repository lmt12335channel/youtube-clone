import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { HistoryView } from "@/modules/playlists/ui/views/history-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.playlists.getHistory.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
}