"use client";

import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface StudioUploaderProps {
  endpoint: string;
  onSuccess: () => void;
}

export const StudioUploader = ({ endpoint, onSuccess }: StudioUploaderProps) => {
  return (
    <>
      <MuxUploader
        id="studio-uploader"
        endpoint={endpoint}
        onSuccess={onSuccess}
        className="hidden"
      />
      <MuxUploaderDrop
        muxUploader="studio-uploader"
        className="group flex h-96 w-full flex-col items-center justify-center gap-y-4 rounded-lg border-2 border-dashed"
      >
        <UploadIcon className="size-10 text-muted-foreground transition-transform group-hover:-translate-y-1" />
        <div className="text-center">
          <p className="font-semibold">Drag and drop video files to upload</p>
          <p className="text-sm text-muted-foreground">
            Your videos will be private until you publish them.
          </p>
        </div>
        <MuxUploaderFileSelect
          muxUploader="studio-uploader"
          className="mt-2 rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Select files
        </MuxUploaderFileSelect>
      </MuxUploaderDrop>
    </>
  );
};