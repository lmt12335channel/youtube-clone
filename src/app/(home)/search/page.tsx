import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: {
    query?: string;
    categoryId?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query, categoryId } = searchParams;

  void trpc.search.getMany.prefetchInfinite({
    query: query ?? "",
    categoryId: categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SearchView query={query ?? ""} categoryId={categoryId} />
    </HydrateClient>
  );
}