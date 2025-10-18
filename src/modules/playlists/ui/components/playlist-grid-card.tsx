import Link from "next/link";
import { type PlaylistGetManyOutput } from "@/modules/playlists/types";
import { PlaylistThumbnail } from "./playlist-thumbnail";
import { PlaylistInfo } from "./playlist-info";

interface PlaylistGridCardProps {
  data: PlaylistGetManyOutput["items"][number];
}

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className="group flex w-full flex-col gap-2">
        <PlaylistThumbnail
          thumbnailUrl={data.thumbnailUrl}
          title={data.name}
          videoCount={data.videoCount}
        />
        <PlaylistInfo data={data} />
      </div>
    </Link>
  );
};