"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { ResponsiveModel } from "@/components/responsive-model";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlaylistCreateModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const PlaylistCreateModel = ({
  open,
  onOpenChange,
  onSuccess,
}: PlaylistCreateModelProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createPlaylist, isPending } = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to create playlist. Please try again.");
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    createPlaylist(values);
  };

  return (
    <ResponsiveModel
      title="Create Playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My favorite videos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              Create
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModel>
  );
};