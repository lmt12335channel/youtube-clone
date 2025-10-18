"use client";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SubscribeButtonProps extends ButtonProps {
  isSubscribed: boolean;
}

export const SubscribeButton = ({
  isSubscribed,
  className,
  ...props
}: SubscribeButtonProps) => {
  return (
    <Button
      className={cn("rounded-full", className)}
      variant={isSubscribed ? "secondary" : "default"}
      {...props}
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
};