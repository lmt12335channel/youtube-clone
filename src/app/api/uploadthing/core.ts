import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();
const utapi = new UTApi();


export const ourFileRouter = {
  bannerUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
      if (!existingUser) throw new UploadThingError("Unauthorized");

      if (existingUser.bannerKey) {
        await utapi.deleteFiles(existingUser.bannerKey);
        await db.update(users).set({ bannerKey: null, bannerUrl: null }).where(eq(users.id, existingUser.id));
      }
      
      return { userId: existingUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.update(users).set({ bannerUrl: file.url, bannerKey: file.key }).where(eq(users.id, metadata.userId));
      return { uploadedBy: metadata.userId };
    }),

  thumbnailUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ videoId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
      if (!existingUser) throw new UploadThingError("Unauthorized");
      
      return { userId: existingUser.id, videoId: input.videoId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.update(videos).set({ thumbnailUrl: file.url, thumbnailKey: file.key }).where(eq(videos.id, metadata.videoId));
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;