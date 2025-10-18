import Link from "next/link";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { z } from "zod";

import { videoSelectSchema } from "@/db/schema";
import { appURL } from "@/constants";
import { Button } from "@/components/ui/button";

// Dùng z.infer để tạo ra type từ Zod schema
type SelectVideo = z.infer<typeof videoSelectSchema>;

interface InfoBoxProps {
  video: SelectVideo;
}

export const InfoBox = ({ video }: InfoBoxProps) => {
  const videoUrl = `${appURL}/videos/${video.id}`;

  const onCopy = () => {
    void navigator.clipboard.writeText(videoUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted p-4">
      {/* Video Link */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Video link</p>
        <div className="flex items-center gap-2">
          <Link href={videoUrl} className="flex-1 truncate text-sm text-blue-500 hover:underline">
            {videoUrl}
          </Link>
          <Button size="icon" variant="ghost" className="shrink-0" onClick={onCopy}>
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      {/* Filename */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Filename</p>
        <p className="truncate text-sm text-muted-foreground">{video.title}.mp4</p>
      </div>
      {/* Mux Status */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Status</p>
        <p className="truncate text-sm capitalize text-muted-foreground">{video.muxStatus}</p>
      </div>
    </div>
  );
};