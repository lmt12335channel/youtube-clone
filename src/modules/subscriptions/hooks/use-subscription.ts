'use client';

import { toast } from 'sonner';
import { useClerk } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';

interface UseSubscriptionProps {
  // ID của người tạo nội dung (channel) mà ta muốn theo dõi
  userId: string;
  // Trạng thái đã đăng ký hay chưa
  isSubscribed: boolean;
  // ID của video hiện tại (nếu có), để làm mới dữ liệu trang video
  fromVideoId?: string;
}

export const useSubscription = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const handleSuccess = () => {
    // Invalidate (làm mới) danh sách subscription ở sidebar
    void utils.subscriptions.getMany.invalidate();
    // Invalidate dữ liệu của trang user để cập nhật subscriber count
    void utils.users.getOne.invalidate({ id: userId });
    // Nếu đang ở trang video, invalidate cả dữ liệu video
    if (fromVideoId) {
      void utils.videos.getOne.invalidate({ id: fromVideoId });
    }
  };

  const handleError = (error: any) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      clerk.openSignIn();
    } else {
      toast.error('Something went wrong!');
    }
  };

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success('Subscribed!');
      handleSuccess();
    },
    onError: handleError,
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success('Unsubscribed!');
      handleSuccess();
    },
    onError: handleError,
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return { isPending, onClick };
};