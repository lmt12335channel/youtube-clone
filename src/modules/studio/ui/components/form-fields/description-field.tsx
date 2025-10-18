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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface DescriptionFieldProps {
  formControl: any;
  videoId: string;
}

export const DescriptionField = ({ formControl, videoId }: DescriptionFieldProps) => {
  const form = useFormContext();
  const utils = trpc.useUtils();

  const { mutate: generateDesc, isPending } = trpc.videos.generateDescription.useMutation({
      onSuccess: () => {
        toast.info("AI job for description started! It may take a moment to update.");
        setTimeout(() => {
          void utils.studio.getOne.invalidate({ id: videoId });
        }, 5000);
      },
      onError: (err) => toast.error(err.message),
    }
  );

  return (
    <FormField
      control={formControl}
      name="description"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Description</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-6 rounded-full"
              onClick={() => generateDesc({ id: videoId })}
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
            <Textarea
              placeholder="Tell viewers about your video"
              className="resize-none"
              rows={5}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};