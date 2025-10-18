"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// --- Props ---
interface PlaylistHeaderSectionProps {
  playlistId: string;
}

// --- Skeleton ---
const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-64" />
    </div>
  );
};

// --- Component Logic ---
const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

  const { mutate: removePlaylist, isPending } = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      void utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-sm text-muted-foreground">
          {playlist.description || "No description."}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={isPending}
        onClick={() => removePlaylist({ id: playlistId })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
};

// --- Component Chính ---
export const PlaylistHeaderSection = (props: PlaylistHeaderSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải thông tin playlist.</p>}>
      <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
        <PlaylistHeaderSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};