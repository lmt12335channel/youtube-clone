import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
}