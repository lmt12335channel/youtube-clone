"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Loader2 } from "lucide-react";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { ResponsiveModel } from "@/components/responsive-model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { PlaylistCreateModel } from "./playlist-create-model";

interface SaveToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const SaveToPlaylistModal = ({
  open,
  onOpenChange,
  videoId,
}: SaveToPlaylistModalProps) => {
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const utils = trpc.useUtils();

  const {
    data: playlists,
    isLoading,
    ...query
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: open, 
    }
  );

  const { mutate: addVideo } = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Video added to playlist");
      void utils.playlists.getManyForVideo.invalidate({ videoId });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: removeVideo } = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      void utils.playlists.getManyForVideo.invalidate({ videoId });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleToggle = (playlistId: string, containsVideo: boolean) => {
    if (containsVideo) {
      removeVideo({ playlistId, videoId });
    } else {
      addVideo({ playlistId, videoId });
    }
  };

  return (
    <>
      <PlaylistCreateModel
        open={isCreateModelOpen}
        onOpenChange={setIsCreateModelOpen}
        onSuccess={() => {
          void utils.playlists.getManyForVideo.invalidate({ videoId });
        }}
      />
      <ResponsiveModel
        title="Save to..."
        open={open}
        onOpenChange={onOpenChange}
      >
        <div className="flex flex-col p-4">
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {!isLoading && playlists && (
            <div className="flex flex-col gap-2">
              {playlists.pages
                .flatMap((page) => page.items)
                .map((playlist) => (
                  <Button
                    key={playlist.id}
                    variant="ghost"
                    className="w-full justify-start px-2"
                    onClick={() => handleToggle(playlist.id, playlist.containsVideo)}
                  >
                    <Checkbox
                      checked={playlist.containsVideo}
                      className="mr-2"
                    />
                    <span className="line-clamp-1 text-left">{playlist.name}</span>
                  </Button>
                ))}
              <InfiniteScroll
                hasMore={query.hasNextPage}
                isLoading={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
                isManual
              />
            </div>
          )}
          
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setIsCreateModelOpen(true)}
          >
            <PlusIcon className="mr-2 size-4" />
            Create new playlist
          </Button>
        </div>
      </ResponsiveModel>
    </>
  );
};