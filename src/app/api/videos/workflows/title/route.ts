import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

const titleSystemPrompt = `
Your task is to generate an SEO-focused title for a YouTube video based on its transcript.
Please follow these guidelines:
1. The title should be concise, engaging, and accurately reflect the video's content.
2. Incorporate relevant keywords naturally.
3. The title must be 70 characters or less.
4. Do not include quotes in the title.
5. The output must be only the title string itself.
`;

interface VideoWorkflowPayload {
  videoId: string;
}

export const { POST } = serve<VideoWorkflowPayload>(async (ctx) => {
  const { videoId } = ctx.requestPayload;

  // 🟢 Bước 1: Lấy video
  const video = await ctx.run("Get Video", async () => {
    const [data] = await db.select().from(videos).where(eq(videos.id, videoId));
    if (!data) throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
    if (!data.muxPlaybackId || !data.muxTrackId) {
      throw new Error("Video missing Mux track information.");
    }
    return data;
  });

  // 🟢 Bước 2: Tải transcript từ Mux
  const transcript = await ctx.run("Get Transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.vtt`;
    const response = await fetch(trackUrl);
    if (!response.ok) throw new Error("Failed to fetch transcript.");
    const vttContent = await response.text();
    return vttContent
      .split("\n")
      .filter(
        (line) =>
          !line.includes("-->") &&
          !line.startsWith("WEBVTT") &&
          line.trim() !== ""
      )
      .join(" ");
  });

  // 🟢 Bước 3: Gọi OpenAI (qua ctx.call)
  const aiResponse = await ctx.call("Generate Title", {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: titleSystemPrompt },
        { role: "user", content: transcript },
      ],
    }),
  });

  // 🟢 Ép kiểu để tránh lỗi "body is unknown"
  const result = (await (aiResponse.body as Response).json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const title = result.choices?.[0]?.message?.content?.trim();
  if (!title) throw new Error("AI failed to generate title.");

  // 🟢 Bước 4: Cập nhật DB
  await ctx.run("Update Video", async () => {
    await db.update(videos).set({ title }).where(eq(videos.id, videoId));
  });

  return { success: true, title };
});
