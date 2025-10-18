"use client";

import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { type VideoGetOneOutput } from "@/modules/videos/types";
import { trpc } from "@/trpc/client";
import { formatCompactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoOwner } from "./video-owner";
import { VideoMenu } from "./video-menu";
import { VideoDescription } from "./video-description";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const utils = trpc.useUtils();
  const { openSignIn } = useClerk();

  const handleMutationSuccess = () => {
    void utils.videos.getOne.invalidate({ id: video.id });
  };

  const handleMutationError = (err: any) => {
    if (err.data?.code === "UNAUTHORIZED") {
      toast.error("You must be logged in to react.");
      openSignIn();
      return;
    }
    toast.error("Something went wrong. Please try again.");
  };

  const { mutate: like } = trpc.videoReactions.like.useMutation({
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  const { mutate: dislike } = trpc.videoReactions.dislike.useMutation({
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sửa lại ở đây: Truyền đầy đủ các prop cần thiết */}
        <VideoOwner
          user={video.user}
          videoId={video.id}
          subscriberCount={video.subscriberCount}
          isSubscribed={video.isSubscribed}
        />

        <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
          {/* Nút Like/Dislike */}
          <div className="flex items-center">
            <Button
              variant={video.viewerReaction === "like" ? "default" : "secondary"}
              onClick={() => like({ videoId: video.id })}
              className="rounded-l-full"
            >
              <ThumbsUp className="mr-2 size-4" />
              {formatCompactNumber(video.likeCount)}
            </Button>
            <Separator orientation="vertical" className="h-full" />
            <Button
              variant={video.viewerReaction === "dislike" ? "default" : "secondary"}
              onClick={() => dislike({ videoId: video.id })}
              className="rounded-r-full"
            >
              <ThumbsDown className="size-4" />
            </Button>
          </div>

          <VideoMenu videoId={video.id} />
        </div>
      </div>

      <VideoDescription video={video} />
    </div>
  );
};