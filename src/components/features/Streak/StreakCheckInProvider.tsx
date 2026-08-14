"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { streakApi } from "@/lib/api/streak/streakApi";
import { STREAK_QUERY_KEY } from "@/lib/api/streak/streakQuery";

// Lazy load StreakDetailDialog - heavy với framer-motion animations
const StreakDetailDialog = dynamic(
  () => import("./StreakDetailDialog").then((mod) => mod.default),
  { ssr: false },
);

function isEveningInVietnam(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  return hour >= 20;
}

export default function StreakCheckInProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const queryClient = useQueryClient();
  const hasCheckedInRef = useRef(false);

  useEffect(() => {
    // Only run when user is authenticated and not already checked in
    if (!isAuthenticated || hasCheckedInRef.current) {
      return;
    }

    // Wait for hydration to complete before making API call
    const doCheckIn = () => {
      hasCheckedInRef.current = true;

      streakApi
        .checkIn()
        .then((result) => {
          queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });

          if (result.isNewCheckIn) {
            const evening = isEveningInVietnam();
            toast.success(
              evening
                ? `🌙 Ghé tối nay! +1 ngày chuỗi — tổng ${result.totalActiveDays} ngày`
                : `🔥 +1 ngày ghé thăm! Tổng cộng ${result.totalActiveDays} ngày`,
              { duration: 4000 },
            );
          }

          for (const badge of result.newlyUnlockedBadges) {
            toast.success(`🏅 Huy hiệu mới: ${badge.name}`, {
              description: badge.description,
              duration: 6000,
            });
          }
        })
        .catch((err) => {
          console.error("[StreakCheckIn] Error:", err);
          hasCheckedInRef.current = false;
        });
    };

    // If already hydrated, check in immediately
    if (hasHydrated) {
      doCheckIn();
    } else {
      // Poll for hydration to complete
      const interval = setInterval(() => {
        const currentHydrated = useAuthStore.getState()._hasHydrated;
        if (currentHydrated) {
          clearInterval(interval);
          doCheckIn();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, hasHydrated, queryClient]);

  return (
    <>
      {children}
      <StreakDetailDialog />
    </>
  );
}
