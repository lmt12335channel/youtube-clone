"use client";

import { AlertTriangleIcon, InfoIcon } from "lucide-react";
import type { videos } from "@/db/schema";

interface VideoBannerProps {
    status: typeof videos.$inferSelect.muxStatus;
}

export const VideoBanner = ({ status }: VideoBannerProps) => {
    // Nếu video đã sẵn sàng, không hiển thị gì cả
    if (status === "ready") {
        return null;
    }

    // Nếu video bị lỗi
    if (status === "errored") {
        return (
            <div className="bg-red-500 p-3 px-4 rounded-xl flex items-center gap-2">
                <InfoIcon className="size-4 text-white shrink-0" />
                <p className="text-xs md:text-sm font-medium text-white line-clamp-1">
                    There was an error processing this video.
                </p>
            </div>
        );
    }

    // Mặc định, hiển thị trạng thái đang xử lý
    return (
        <div className="bg-yellow-500 p-3 px-4 rounded-xl flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-black shrink-0" />
            <p className="text-xs md:text-sm font-medium text-black line-clamp-1">
                This video is still being processed.
            </p>
        </div>
    );
};