"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { type VideoGetOneOutput } from "@/modules/videos/types";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { SubscribeButton } from "@/modules/subscriptions/ui/components/subscribe-button";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/lib/utils";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
  subscriberCount: number;
  isSubscribed: boolean;
}

export const VideoOwner = ({
  user,
  videoId,
  subscriberCount,
  isSubscribed,
}: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();
  const isOwner = user.clerkId === userId;

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: isSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
      <Link href={`/users/${user.id}`}>
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.name}
          size="lg"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <UserInfo name={user.name} size="default" />
        <p className="text-xs text-muted-foreground">
          {formatCompactNumber(subscriberCount)} subscribers
        </p>
      </div>
      <div>
        {isOwner ? (
          <Button asChild variant="secondary" className="rounded-full">
            <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
          </Button>
        ) : (
          <SubscribeButton
            isSubscribed={isSubscribed}
            onClick={onClick}
            disabled={isPending || !isLoaded}
          />
        )}
      </div>
    </div>
  );
};