import { SubscribedVideosSection } from "../sections/subscribed-videos-section";

export const SubscribedView = () => {
  return (
    <div className="mx-auto flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Videos from your favorite creators.
        </p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};