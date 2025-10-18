"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { PlaylistCreateModel } from "../components/playlist-create-model";
import { PlaylistGridCard } from "../components/playlist-grid-card";

export const PlaylistsView = () => {
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const utils = trpc.useUtils();

  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage: { nextCursor?: string | null }) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <PlaylistCreateModel
        open={isCreateModelOpen}
        onOpenChange={setIsCreateModelOpen}
        onSuccess={() => {
          void utils.playlists.getMany.invalidate();
        }}
      />

      <div className="mx-auto flex max-w-[2400px] flex-col gap-6 p-4 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Playlists</h1>
            <p className="text-sm text-muted-foreground">
              Collections you have created.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setIsCreateModelOpen(true)}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>

        {/* Grid hiển thị các playlist */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {playlists.pages.flatMap((page) =>
            page.items.map((playlist) => (
              <PlaylistGridCard key={playlist.id} data={playlist} />
            ))
          )}
        </div>

        <InfiniteScroll
          hasMore={query.hasNextPage}
          isLoading={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>
    </>
  );
};