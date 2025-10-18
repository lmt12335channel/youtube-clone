"use client";

import { useIsMobile } from "@/hooks/use-is-mobile"; // Hook này được tạo bởi shadcn/ui
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

interface ResponsiveDialogProps {
    children: React.ReactNode;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveDialog = ({
    children,
    title,
    open,
    onOpenChange,
}: ResponsiveDialogProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        );
    }

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