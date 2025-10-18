import { z } from "zod";
import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    // Chỉ yêu cầu videoId từ client
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Lấy userId an toàn từ context (session)
      const { id: userId } = ctx.user;
      
      try {
        // Thử insert trực tiếp
        const [view] = await db
          .insert(videoViews)
          .values({ userId, videoId: input.videoId })
          .returning();
        return { success: true, view };
      } catch (error) {
        // Nếu lỗi (do đã tồn tại), không cần làm gì thêm
        // Trả về success để client biết yêu cầu đã được xử lý
        return { success: true, alreadyViewed: true };
      }
    }),
});