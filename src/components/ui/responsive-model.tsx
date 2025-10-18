'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface ResponsiveModelProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ResponsiveModel({
  title,
  open,
  onOpenChange,
  children
}: ResponsiveModelProps) {
  const isMobile = useIsMobile();

  // Hiển thị Drawer trên thiết bị di động
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {/* Nội dung chính được truyền vào */}
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  // Hiển thị Dialog trên màn hình lớn hơn
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Nội dung chính được truyền vào */}
        {children}
      </DialogContent>
    </Dialog>
  );
}