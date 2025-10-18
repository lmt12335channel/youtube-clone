"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

// Định nghĩa các props mà component sẽ nhận
interface ResponsiveDialogProps {
    children: React.ReactNode; // Nội dung bên trong dialog/drawer
    title: string; // Tiêu đề
    open: boolean; // Trạng thái đóng/mở
    onOpenChange: (open: boolean) => void; // Hàm được gọi khi trạng thái thay đổi
}

export const ResponsiveDialog = ({
    children,
    title,
    open,
    onOpenChange,
}: ResponsiveDialogProps) => {
    // Sử dụng hook tùy chỉnh để kiểm tra kích thước màn hình
    const isMobile = useIsMobile();

    // Nếu là màn hình di động, render Drawer
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    {/* Padding và style cho nội dung trên di động */}
                    <div className="p-4">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }

    // Nếu là màn hình lớn hơn, render Dialog
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};