"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DISCLAIMER_DISMISSED_STORAGE_KEY,
  SITE_DISCLAIMER_TEXT,
} from "@/lib/site-disclaimer";

type DisclaimerNoticeContextValue = {
  openDisclaimer: () => void;
};

const DisclaimerNoticeContext =
  createContext<DisclaimerNoticeContextValue | null>(null);

export function useDisclaimerNotice() {
  const ctx = useContext(DisclaimerNoticeContext);
  if (!ctx) {
    return { openDisclaimer: () => {} };
  }
  return ctx;
}

export function DisclaimerNoticeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const dismissed =
        window.localStorage.getItem(DISCLAIMER_DISMISSED_STORAGE_KEY) === "1";
      if (!dismissed) setOpen(true);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, []);

  const openDisclaimer = useCallback(() => setOpen(true), []);

  const persistDismiss = () => {
    try {
      window.localStorage.setItem(DISCLAIMER_DISMISSED_STORAGE_KEY, "1");
    } catch {}
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) persistDismiss();
    setOpen(next);
  };

  return (
    <DisclaimerNoticeContext.Provider value={{ openDisclaimer }}>
      {children}
      {ready ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{"L\u01b0u \u00fd"}</DialogTitle>
              <DialogDescription className="text-left text-base leading-relaxed text-muted-foreground">
                {SITE_DISCLAIMER_TEXT}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {"Đã hiểu, không hiển thị lại"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </DisclaimerNoticeContext.Provider>
  );
}
