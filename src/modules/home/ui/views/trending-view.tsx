import { TrendingVideosSection } from "../sections/trending-videos-section";

export const TrendingView = () => {
  return (
    <div className="mx-auto flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Trending</h1>
        <p className="text-sm text-muted-foreground">
          Most popular videos at the moment.
        </p>
      </div>
      <TrendingVideosSection />
    </div>
  );
};