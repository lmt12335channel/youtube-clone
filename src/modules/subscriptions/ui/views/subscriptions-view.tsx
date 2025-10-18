import { SubscriptionsSection } from "../components/sections/subscriptions-section";

export const SubscriptionsView = () => {
  return (
    <div className="mx-auto max-w-screen-md flex-col gap-6 p-4 pt-2.5 md:flex">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">All Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all your subscriptions.
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
};