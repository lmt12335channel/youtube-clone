"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  MoreVertical,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { AppRouter } from "@/trpc/routers/_app";
import type { TRPCClientError } from "@trpc/client";
import { type CommentGetManyOutput } from "@/modules/comments/types";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "@/modules/comments/ui/components/comment-replies";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";


// --- Props ---
interface CommentItemProps {
  comment: CommentGetManyOutput[number];
  variant?: "comment" | "reply";
}

// --- Component ---
export const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const { userId } = useAuth();
  const { openSignIn } = useClerk();
  const utils = trpc.useUtils();

  const { mutate: removeComment } = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      void utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: () => toast.error("Something went wrong"),
  });

  const { mutate: likeComment } = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (err: TRPCClientError<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        openSignIn();
        return;
      }
      toast.error("Something went wrong");
    },
  });

  const { mutate: dislikeComment } = trpc.commentReactions.dislike.useMutation({
      onSuccess: () => {
        void utils.comments.getMany.invalidate({ videoId: comment.videoId });
      },
      onError: (err: TRPCClientError<AppRouter>) => {
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
          return;
        }
        toast.error("Something went wrong");
      },
    }
  );

  const createdAt = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const isOwner = comment.user.clerkId === userId;

  return (
    <div className="flex gap-4">
      <Link href={`/users/${comment.user.id}`}>
        <UserAvatar
          imageUrl={comment.user.imageUrl}
          name={comment.user.name}
          size={variant === "comment" ? "lg" : "default"}
        />
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/users/${comment.user.id}`}>
            <p className="text-sm font-semibold">{comment.user.name}</p>
          </Link>
          <p className="text-xs text-muted-foreground">{createdAt}</p>
        </div>
        <p className="text-sm">{comment.value}</p>

        {/* Nút Like, Dislike, Reply */}
        <div className="mt-1 flex items-center gap-2">
          {/* Like */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => likeComment({ commentId: comment.id })}
            >
              <ThumbsUp
                className={cn(
                  "size-4",
                  comment.viewerReaction === "like" && "fill-primary text-primary"
                )}
              />
            </Button>
            <span className="text-xs text-muted-foreground">
              {comment.likeCount}
            </span>
          </div>

          {/* Dislike */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => dislikeComment({ commentId: comment.id })}
            >
              <ThumbsDown
                className={cn(
                  "size-4",
                  comment.viewerReaction === "dislike" && "fill-primary text-primary"
                )}
              />
            </Button>
          </div>

          {/* Reply */}
          {variant === "comment" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setIsReplyOpen(true)}
            >
              Reply
            </Button>
          )}
        </div>

        {/* Form trả lời (hiển thị có điều kiện) */}
        {isReplyOpen && variant === "comment" && (
          <div className="mt-4">
            <CommentForm
              videoId={comment.videoId}
              parentId={comment.id}
              variant="reply"
              onSuccess={() => {
                setIsReplyOpen(false);
                setIsRepliesOpen(true);
              }}
              onCancel={() => setIsReplyOpen(false)}
            />
          </div>
        )}
        
        {/* Nút xem và danh sách các replies */}
        {comment.replyCount > 0 && variant === 'comment' && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsRepliesOpen((prev) => !prev)}
            className="mt-2"
          >
            {isRepliesOpen ? (
              <ChevronUp className="mr-2 size-4" />
            ) : (
              <ChevronDown className="mr-2 size-4" />
            )}
            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </Button>
        )}

        {isRepliesOpen && (
          <CommentReplies parentId={comment.id} videoId={comment.videoId} />
        )}
      </div>

      {/* Dropdown Menu (chỉ hiển thị cho chủ sở hữu) */}
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => removeComment({ id: comment.id })}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};