"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreVertical, ListPlus, Share, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveToPlaylistModal } from "@/modules/playlists/ui/components/save-to-playlist-modal";

interface VideoMenuProps {
  videoId: string;
  onRemove?: () => void;
}

export const VideoMenu = ({ videoId, onRemove }: VideoMenuProps) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const onShare = () => {
    const url = `${window.location.origin}/videos/${videoId}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      <SaveToPlaylistModal
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        videoId={videoId}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-full">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
        >
          <DropdownMenuItem onClick={() => setIsSaveModalOpen(true)}>
            <ListPlus className="mr-2 size-4" />
            <span>Save to playlist</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share className="mr-2 size-4" />
            <span>Share</span>
          </DropdownMenuItem>
          {onRemove && ( // Chỉ hiển thị nút xóa nếu có hàm onRemove
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              <span>Remove</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};