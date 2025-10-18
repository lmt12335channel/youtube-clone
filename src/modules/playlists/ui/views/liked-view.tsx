import { LikedVideosSection } from "../sections/liked-videos-section";

export const LikedView = () => {
  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-6 p-4 pt-2.5">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Liked Videos</h1>
        <p className="text-sm text-muted-foreground">
          Videos you have liked.
        </p>
      </div>
      <LikedVideosSection />
    </div>
  );
};