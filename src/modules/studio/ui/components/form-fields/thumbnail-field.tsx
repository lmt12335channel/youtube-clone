"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { ImagePlus, Sparkles, RotateCcw, MoreVertical } from "lucide-react";

import { videoSelectSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { FormLabel } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { thumbnailFallback } from "@/modules/videos/constants";
import { ThumbnailGenerateModel } from "../thumbnail-generate-model";
import { ThumbnailUploadModel } from "../thumbnail-upload-model";

// Sử dụng z.infer để tạo ra type từ schema
type SelectVideo = z.infer<typeof videoSelectSchema>;

interface ThumbnailFieldProps {
  video: SelectVideo;
}

export const ThumbnailField = ({ video }: ThumbnailFieldProps) => {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutate: restoreThumbnail } = trpc.videos.restoreThumbnail.useMutation({
      onSuccess: () => {
        toast.success("Thumbnail restored to default");
        void utils.studio.getOne.invalidate({ id: video.id });
      },
      onError: (err) => toast.error(err.message),
    }
  );

  return (
    <>
      <ThumbnailGenerateModel videoId={video.id} open={isGenerateOpen} onOpenChange={setIsGenerateOpen} />
      <ThumbnailUploadModel videoId={video.id} open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      
      <div className="space-y-2">
        <FormLabel>Thumbnail</FormLabel>
        <div className="relative aspect-video w-[153px] overflow-hidden rounded-lg border border-dashed">
          <Image
            src={video.thumbnailUrl ?? thumbnailFallback}
            alt={video.title}
            fill
            className="object-cover"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 size-7 rounded-full bg-black/50 hover:bg-black/50">
                {/* Sử dụng Icon thay vì text "..." */}
                <MoreVertical className="size-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsUploadOpen(true)}>
                <ImagePlus className="mr-2 size-4" /> Change
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsGenerateOpen(true)}>
                <Sparkles className="mr-2 size-4" /> Generate with AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => restoreThumbnail({ id: video.id })}>
                <RotateCcw className="mr-2 size-4" /> Restore Default
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};