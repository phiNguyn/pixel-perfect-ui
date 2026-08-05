"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { ReactNode } from "react";

interface BaseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  contentClassName?: string;
  customHeader?: ReactNode;
}

export default function BaseDrawer({
  open,
  onOpenChange,
  title,
  children,
  contentClassName = "",
  customHeader,
}: BaseDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`rounded-t-2xl ${contentClassName}`}>
        <DrawerHeader className="border-b border-border/50 p-4 text-left">
          {customHeader ? (
            customHeader
          ) : (
            <DrawerTitle className="text-foreground font-bold text-lg tracking-tight">
              {title}
            </DrawerTitle>
          )}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
