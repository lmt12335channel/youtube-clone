import { PlaylistHeaderSection } from "../sections/playlist-header-section";
import { VideosSection } from "../sections/videos-section";

interface VideosViewProps {
  playlistId: string;
}

export const VideosView = ({ playlistId }: VideosViewProps) => {
  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-6 p-4 pt-2.5">
      <PlaylistHeaderSection playlistId={playlistId} />
      <VideosSection playlistId={playlistId} />
    </div>
  );
};