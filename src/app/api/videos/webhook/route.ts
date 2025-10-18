import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";
import type {
    VideoAssetReadyWebhookEvent,
    VideoAssetCreatedWebhookEvent,
    VideoAssetTrackReadyWebhookEvent,
    VideoAssetErroredWebhookEvent,
    VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs"

type WebhookEvent = 
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetTrackReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetDeletedWebhookEvent;

const utapi = new UTApi();

// ✅ QUAN TRỌNG: Return response ngay, xử lý upload async
export async function POST(req: Request) {
    const headersList = await headers();
    const body = await req.text();
    
    let event: WebhookEvent;
    
    try {
        event = mux.webhooks.unwrap(
            body,
            headersList,
            process.env.MUX_WEBHOOK_SECRET!
        ) as WebhookEvent;
    } catch (error) {
        console.error("[MUX_WEBHOOK_VERIFY_ERROR]", error);
        return new Response("Invalid signature", { status: 400 });
    }

    try {
        if (event.type === "video.asset.created") {
            const uploadId = event.data.upload_id;
            if (uploadId) {
                await db.update(videos).set({
                    muxAssetId: event.data.id,
                    muxStatus: event.data.status,
                }).where(eq(videos.muxUploadId, uploadId));
            }
        }

        if (event.type === "video.asset.ready") {
            const playbackId = event.data.playback_ids?.[0]?.id;
            const assetId = event.data.id;
            
            if (!playbackId) {
                return new Response("Playback ID not found", { status: 400 });
            }

            // ✅ Update DB ngay với playback ID và duration
            await db.update(videos).set({
                muxStatus: event.data.status,
                muxPlaybackId: playbackId,
                duration: Math.round((event.data.duration ?? 0) * 1000),
            }).where(eq(videos.muxAssetId, assetId));

            // ✅ Upload thumbnails ASYNC - không await
            uploadThumbnails(assetId, playbackId).catch((error) => {
                console.error("[THUMBNAIL_UPLOAD_ERROR]", error);
            });

            // ✅ Return ngay để tránh timeout
            return new Response("Processing thumbnails", { status: 200 });
        }

        if (event.type === "video.asset.track.ready") {
            const assetId = (event.data as any).asset_id;
            await db.update(videos).set({
                muxTrackId: event.data.id,
                muxTrackStatus: event.data.status,
            }).where(eq(videos.muxAssetId, assetId));
        }
        
        if (event.type === "video.asset.errored") {
            await db.update(videos).set({
                muxStatus: "errored",
            }).where(eq(videos.muxAssetId, event.data.id));
        }

        if (event.type === "video.asset.deleted") {
            const assetId = (event.data as any).id;
            await db.delete(videos).where(eq(videos.muxAssetId, assetId));
        }

    } catch (error) {
        console.error("[MUX_WEBHOOK_ERROR]", error);
        return new Response("Webhook handler error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
}

// ✅ Hàm xử lý upload riêng biệt
async function uploadThumbnails(assetId: string, playbackId: string) {
    try {
        console.log(`[THUMBNAIL_UPLOAD_START] Asset: ${assetId}`);

        const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=2`;
        const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif?fps=15&width=320`;

        // Upload với timeout riêng
        const [thumbnailUpload, previewUpload] = await Promise.race([
            utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Upload timeout')), 25000)
            )
        ]);

        if (thumbnailUpload.error || previewUpload.error) {
            throw new Error(`Upload failed: ${thumbnailUpload.error || previewUpload.error}`);
        }

        const { data: thumbnailData } = thumbnailUpload;
        const { data: previewData } = previewUpload;

        if (!thumbnailData || !previewData) {
            throw new Error("Uploaded image data not found");
        }

        // Update DB với thumbnail URLs
        await db.update(videos).set({
            thumbnailUrl: thumbnailData.url,
            thumbnailKey: thumbnailData.key,
            previewUrl: previewData.url,
            previewKey: previewData.key,
        }).where(eq(videos.muxAssetId, assetId));

        console.log(`[THUMBNAIL_UPLOAD_SUCCESS] Asset: ${assetId}`);
    } catch (error) {
        console.error(`[THUMBNAIL_UPLOAD_FAILED] Asset: ${assetId}`, error);
        
        // ✅ Retry logic - có thể implement queue ở đây
        // hoặc mark video để retry sau
        await db.update(videos).set({
            // Thêm field thumbnailStatus: 'failed' nếu cần
        }).where(eq(videos.muxAssetId, assetId));
    }
}