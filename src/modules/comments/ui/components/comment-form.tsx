"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";

import { trpc } from "@/trpc/client";
import { commentInsertSchema } from "@/db/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { userPlaceholderImage } from "@/constants";

// --- Props ---
interface CommentFormProps {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

// --- Schema ---
// Lược bỏ userId vì nó sẽ được lấy từ session ở backend
const formSchema = commentInsertSchema.omit({ userId: true });

// --- Component ---
export const CommentForm = ({
  videoId,
  parentId,
  onSuccess,
  onCancel,
  variant = "comment",
}: CommentFormProps) => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId,
      parentId: parentId ?? null,
      value: "",
    },
  });

  const { mutate: createComment, isPending } = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success(variant === "comment" ? "Comment added" : "Reply added");
      void utils.comments.getMany.invalidate({ videoId });
      form.reset();
      onSuccess?.();
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        toast.error("You must be logged in to comment.");
        openSignIn();
        return;
      }
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to comment.");
      openSignIn();
      return;
    }
    createComment(values);
  };

  return (
    <div className="flex gap-4">
      <UserAvatar
        imageUrl={user?.imageUrl ?? userPlaceholderImage}
        name={user?.username ?? "User"}
        size={variant === "comment" ? "lg" : "default"}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex-1"
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={
                      variant === "reply"
                        ? "Add a reply..."
                        : "Add a comment..."
                    }
                    className="min-h-0 resize-none overflow-hidden border-0 border-b-2 border-border bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-2 flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={isPending}>
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};