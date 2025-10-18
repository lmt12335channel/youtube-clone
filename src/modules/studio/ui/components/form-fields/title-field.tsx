"use client";

import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

import { trpc } from "@/trpc/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TitleFieldProps {
  formControl: any; // Control from react-hook-form
  videoId: string;
}

export const TitleField = ({ formControl, videoId }: TitleFieldProps) => {
  const form = useFormContext();
  const utils = trpc.useUtils();

  const { mutate: generateTitle, isPending } = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.info("AI job for title started! It may take a moment to update.");
      // Invalidate to refetch after a delay
      setTimeout(() => {
        void utils.studio.getOne.invalidate({ id: videoId });
      }, 5000); // Poll after 5 seconds
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <FormField
      control={formControl}
      name="title"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Title</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-6 rounded-full"
              onClick={() => generateTitle({ id: videoId })}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Sparkles className="size-3" />
              )}
            </Button>
          </div>
          <FormControl>
            <Input placeholder="Add a title for your video" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};