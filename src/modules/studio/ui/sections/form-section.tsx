"use client";

import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2Icon, MoreVertical, Trash2 } from "lucide-react";

import { trpc } from "@/trpc/client";
import { videoUpdateSchema, categorySelectSchema } from "@/db/schema";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { TitleField } from "../components/form-fields/title-field";
import { DescriptionField } from "../components/form-fields/description-field";
import { ThumbnailField } from "../components/form-fields/thumbnail-field";
import { CategoryField } from "../components/form-fields/category-field";
import { VisibilityField } from "../components/form-fields/visibility-field";
import { InfoBox } from "../components/info-box";

// --- Props & Schema ---
interface FormSectionProps {
  videoId: string;
}
type FormSchema = z.infer<typeof videoUpdateSchema>;
type SelectCategory = z.infer<typeof categorySelectSchema>;

// --- Skeleton ---
const FormSectionSkeleton = () => {
  return <Skeleton className="h-[70vh] w-full" />;
};

// --- Component Logic ---
const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  if (!video) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Video not found.</p>
      </div>
    );
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: {
      id: video.id,
      title: video.title,
      description: video.description ?? "",
      categoryId: video.categoryId ?? undefined,
      visibility: video.visibility,
    },
  });

  // Đồng bộ lại form khi dữ liệu từ server thay đổi (ví dụ: sau khi AI generate xong)
  useEffect(() => {
    form.reset({
      id: video.id,
      title: video.title,
      description: video.description ?? "",
      categoryId: video.categoryId ?? undefined,
      visibility: video.visibility,
    });
  }, [video, form]);

  // --- Mutations ---
  const { mutate: updateVideo, isPending: isUpdating } = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Changes saved!");
      void utils.studio.getMany.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: removeVideo, isPending: isRemoving } = trpc.videos.remove.useMutation({
    onSuccess: () => {
      toast.success("Video deleted");
      void utils.studio.getMany.invalidate();
      router.push("/studio");
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (values: FormSchema) => {
    updateVideo(values);
  };
  
  const isPending = isUpdating || isRemoving;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Header: Title, Save, Delete */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video details</h1>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isUpdating && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending}>
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => removeVideo({ id: videoId })}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete forever
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left Column */}
          <div className="flex flex-col gap-8 lg:col-span-3">
            <TitleField formControl={form.control} videoId={videoId} />
            <DescriptionField formControl={form.control} videoId={videoId} />
            <ThumbnailField video={video} />
            <CategoryField formControl={form.control} categories={categories} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <VideoPlayer
              playbackId={video.muxPlaybackId}
              thumbnailUrl={video.thumbnailUrl}
              videoId={video.id}
            />
            <InfoBox video={video} />
            <VisibilityField formControl={form.control} />
          </div>
        </div>
      </form>
    </Form>
  );
};


// --- Component Chính ---
export const FormSection = (props: FormSectionProps) => {
  return (
    <ErrorBoundary fallback={<p>Lỗi khi tải thông tin video.</p>}>
      <Suspense fallback={<FormSectionSkeleton />}>
        <FormSectionSuspense {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};