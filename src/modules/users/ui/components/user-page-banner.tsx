"use client";

import { Edit2Icon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { type UserGetOneOutput } from "@/modules/users/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageBannerProps {
  user: UserGetOneOutput;
}

export const UserPageBannerSkeleton = () => {
  return (
    <Skeleton className="h-[15vh] w-full max-w-[200px] md:h-[25vh]" />
  );
};

export const UserPageBanner = ({ user }: UserPageBannerProps) => {
  const { userId } = useAuth();
  const isOwner = user.clerkId === userId;

  return (
    <div className="group relative">
      <div
        className={cn(
          "h-[15vh] w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 md:h-[25vh]",
          user.bannerUrl && "bg-cover bg-center"
        )}
        style={{
          backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined,
        }}
      />
      {isOwner && (
        <Button
          size="icon"
          className="absolute right-4 top-4 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100"
        >
          <Edit2Icon className="size-4 text-white" />
        </Button>
      )}
    </div>
  );
};