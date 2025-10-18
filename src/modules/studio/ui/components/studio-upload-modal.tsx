"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, Loader2 } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ResponsiveModel } from "@/components/responsive-model";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const router = useRouter();
  const {
    data: createData,
    mutate: createVideo,
    isPending,
    reset,
  } = trpc.videos.create.useMutation({
    onSuccess: (data) => {
      // Dữ liệu trả về từ 'create' đã có videoId,
      // nhưng chúng ta sẽ điều hướng sau khi upload thành công.
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleUploadSuccess = () => {
    if (createData?.id) {
      toast.success("Video uploaded successfully!");
      router.push(`/studio/videos/${createData.id}`);
      reset();
    }
  };

  return (
    <>
      <Button onClick={() => createVideo()} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <PlusIcon className="mr-2 size-4" />
        )}
        Create
      </Button>

      {/* Modal chỉ hiển thị khi đã có uploadUrl từ tRPC */}
      <ResponsiveModel
        title="Upload a video"
        open={!!createData}
        onOpenChange={() => reset()}
      >
        {createData?.uploadUrl && (
          <StudioUploader
            endpoint={createData.uploadUrl}
            onSuccess={handleUploadSuccess}
          />
        )}
      </ResponsiveModel>
    </>
  );
};