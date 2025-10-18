'use client';

import { ResponsiveModel } from '@/components/ui/responsive-model';
import { UploadDropzone } from '@/utils/uploadthing';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';

interface ThumbnailUploadModelProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModel = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModelProps) => {
  const utils = trpc.useUtils();

  return (
    <ResponsiveModel
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={async () => {
          // Invalidate (làm mới) dữ liệu của video cụ thể này
          await utils.studio.getOne.invalidate({ id: videoId });
          // Invalidate danh sách tất cả video trong studio
          await utils.studio.getMany.invalidate();

          toast.success('Thumbnail uploaded successfully!');
          onOpenChange(false);
        }}
        onUploadError={() => {
          toast.error('Something went wrong!');
        }}
        config={{
          mode: 'auto',
        }}
      />
    </ResponsiveModel>
  );
};