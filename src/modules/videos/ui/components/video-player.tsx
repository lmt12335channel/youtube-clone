"use client";

import { useRef } from "react";
import MuxPlayer from "@mux/mux-player-react"; 
import { trpc } from "@/trpc/client";

interface VideoPlayerProps {
    playbackId: string | null | undefined;
    thumbnailUrl?: string | null;
    videoId: string;
}

export const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    videoId,
}: VideoPlayerProps) => {
    const hasPlayed = useRef(false);
    const addView = trpc.videoViews.create.useMutation();

    const handlePlay = () => {
        if (!hasPlayed.current && videoId) {
            addView.mutate({ videoId });
            hasPlayed.current = true;
        }
    };

    if (!playbackId) {
        return (
            <div className="bg-muted w-full h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Video is being processed.</p>
            </div>
        );
    }

    return (
        <MuxPlayer
            playbackId={playbackId}
            poster={thumbnailUrl || `/placeholder.svg`}
            accentColor="#ea580c"
            onPlay={handlePlay}
            className="w-full h-full"
        />
    );
};