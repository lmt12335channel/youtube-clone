import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { descriptionSystemPrompt } from "@/constants/prompts";

interface VideoWorkflowPayload {
  videoId: string;
  userId: string;
}

export const { POST } = serve<VideoWorkflowPayload>(async (ctx) => {
  const { videoId, userId } = ctx.requestPayload;

  // 🟢 Bước 1: Lấy thông tin video
  const video = await ctx.run("Get Video", async () => {
    const [data] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!data || !data.muxPlaybackId || !data.muxTrackId) {
      throw new Error("Video not found or is missing Mux data.");
    }
    return data;
  });

  // 🟢 Bước 2: Lấy transcript
  const transcript = await ctx.run("Get Transcript", async () => {
    const trackURL = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackURL);
    if (!response.ok) throw new Error("Failed to fetch transcript.");
    return await response.text();
  });

  // 🟢 Bước 3: Gọi OpenAI để tạo mô tả
  const openAIResponse = await ctx.call("Generate Description", {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: descriptionSystemPrompt },
        { role: "user", content: transcript },
      ],
    }),
  });

  // ✅ Ép kiểu body để tránh lỗi "unknown"
  const result = (await (openAIResponse.body as Response).json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const description = result.choices?.[0]?.message?.content;
  if (!description) throw new Error("AI failed to generate a description.");

  // 🟢 Bước 4: Cập nhật video
  await ctx.run("Update Video", async () => {
    await db.update(videos).set({ description }).where(eq(videos.id, videoId));
  });

  return { success: true, description };
});
