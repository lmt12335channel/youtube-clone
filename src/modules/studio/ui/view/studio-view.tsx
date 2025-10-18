"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { VideosSection } from "@/modules/studio/ui/sections/video-sections";

// Component Skeleton cho trạng thái tải
const StudioViewSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
};

// Component chính
export const StudioView = () => {
    return (
        <div className="flex flex-col gap-y-6 p-4 pt-2.5">
            <Suspense fallback={<StudioViewSkeleton />}>
                <ErrorBoundary fallback={<div>Đã xảy ra lỗi khi tải nội dung kênh.</div>}>
                    <StudioViewContent />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
};

// Component chứa logic và nội dung chính
const StudioViewContent = () => {
    return (
        <>
            <div className="flex flex-col gap-y-1">
                <h1 className="text-2xl font-bold">Channel content</h1>
                <p className="text-xs text-muted-foreground">Manage your channel content and videos.</p>
            </div>
            
            {/* Component hiển thị bảng danh sách video */}
            <VideosSection />
        </>
    );
};