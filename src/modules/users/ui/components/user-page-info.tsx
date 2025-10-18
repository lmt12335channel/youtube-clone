"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { type UserGetOneOutput } from "@/modules/users/types";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { formatCompactNumber } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { SubscribeButton } from "@/modules/subscriptions/ui/components/subscribe-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";


interface UserPageInfoProps {
  user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => {
    // Thêm skeleton cho component này nếu bạn muốn
    return <Skeleton className="h-24 w-full" />;
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth();
  const isOwner = user.clerkId === userId;

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.isSubscribed,
  });

  return (
    <div className="py-6">
      {/* Giao diện Mobile */}
      <div className="flex flex-col md:hidden">
        {/* ... Code cho giao diện mobile ... */}
      </div>

      {/* Giao diện Desktop */}
      <div className="hidden items-start gap-4 md:flex">
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.name}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatCompactNumber(user.subscriberCount)} subscribers</span>
            <span>&bull;</span>
            <span>{formatCompactNumber(user.videoCount)} videos</span>
          </div>
        </div>
        <div>
          {isOwner ? (
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/studio">Go to Studio</Link>
            </Button>
          ) : (
            <SubscribeButton
              isSubscribed={user.isSubscribed}
              onClick={onClick}
              disabled={isPending || !isLoaded}
            />
          )}
        </div>
      </div>
    </div>
  );
};