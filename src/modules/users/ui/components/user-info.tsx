"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 1. Định nghĩa các variants cho component
const userInfoVariants = cva("group flex items-center gap-1", {
  variants: {
    size: {
      default: "text-sm",
      small: "text-xs",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// 2. Mở rộng interface để chấp nhận các props từ variants (bao gồm 'size')
interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string;
  className?: string;
}

export const UserInfo = ({ name, className, size }: UserInfoProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* 3. Áp dụng các class từ variants */}
          <div className={cn(userInfoVariants({ size, className }))}>
            <p className="line-clamp-1 text-gray-600 group-hover:text-primary">
              {name}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="bg-black/70 text-white"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};