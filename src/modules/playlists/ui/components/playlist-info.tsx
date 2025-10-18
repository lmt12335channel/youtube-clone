import { type PlaylistGetManyOutput } from "@/modules/playlists/types";

interface PlaylistInfoProps {
  data: PlaylistGetManyOutput["items"][number];
}

export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="break-words text-base font-medium line-clamp-2">
        {data.name}
      </h3>
      <p className="line-clamp-1 text-sm text-muted-foreground hover:text-primary">
        View full playlist
      </p>
    </div>
  );
};