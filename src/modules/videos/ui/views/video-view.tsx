import { CommentSection } from '@/modules/comments/ui/sections/comment-section';
import { SuggestionsSection } from '../sections/suggestions-section';
import { VideoSection } from '../sections/video-section';

interface VideoViewProps {
  videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    // Bố cục chính sử dụng Grid, chia 2 cột trên màn hình lớn (lg)
    <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-x-10 gap-y-6 px-4 pt-2.5 lg:grid-cols-3 lg:px-10">
      
      {/* CỘT TRÁI: Chứa Video chính và Bình luận (chỉ hiển thị trên mobile) */}
      <div className="col-span-1 min-w-0 lg:col-span-2">
        <VideoSection videoId={videoId} />
        
        {/* Phần bình luận này chỉ hiển thị trên mobile (kích thước < lg) */}
        <div className="mt-6 block lg:hidden">
          <CommentSection videoId={videoId} />
        </div>
      </div>
      
      {/* CỘT PHẢI: Chứa Video gợi ý và Bình luận (chỉ hiển thị trên desktop) */}
      <div className="col-span-1 min-w-0">
        <SuggestionsSection videoId={videoId} />

        {/* Phần bình luận này chỉ hiển thị trên desktop (kích thước >= lg) */}
        <div className="mt-6 hidden lg:block">
          <CommentSection videoId={videoId} />
        </div>
      </div>
    </div>
  );
};