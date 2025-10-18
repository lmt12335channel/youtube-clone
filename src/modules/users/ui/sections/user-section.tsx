"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";

import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";
import { UserPageInfo, UserPageInfoSkeleton } from "../components/user-page-info";


interface UserSectionProps {
  userId: string;
}

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
    </div>
  );
};

export const UserSection = ({ userId }: UserSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải thông tin người dùng.</p>}>
      <Suspense fallback={<><UserPageBannerSkeleton /><UserPageInfoSkeleton /></>}>
        <UserSectionSuspense userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
};