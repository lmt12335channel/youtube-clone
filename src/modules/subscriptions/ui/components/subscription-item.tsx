"use client";

import { UserAvatar } from "@/components/user-avatar";
import { formatCompactNumber } from "@/lib/utils";
import { SubscribeButton } from "./subscribe-button";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubscribe: () => void;
  disabled: boolean;
}

export const SubscriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubscribe,
  disabled,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar imageUrl={imageUrl} name={name} size="lg" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCompactNumber(subscriberCount)} subscribers
            </p>
          </div>
          <SubscribeButton
            isSubscribed // Luôn là true vì đây là danh sách kênh đã đăng ký
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Ngăn sự kiện click lan ra thẻ Link cha
              onUnsubscribe();
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};