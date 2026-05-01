"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  renderGoogleButton,
} from "@/lib/google-auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginModal(): JSX.Element | null {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, isLoading } =
    useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoginModalOpen || !googleButtonRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = async () => {
      try {
        await loadGoogleScript();

        const callback = async (credential: string) => {
          setIsSubmitting(true);
          try {
            await loginWithGoogle(credential);
          } catch (err) {
            console.error("Google login failed:", err);
          } finally {
            setIsSubmitting(false);
          }
        };

        initializeGoogleSignIn(clientId, callback);
        renderGoogleButton(googleButtonRef.current, {
          theme: "filled_blue",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        });
      } catch (err) {
        console.error("Failed to init Google button:", err);
      }
    };

    initGoogle();
  }, [isLoginModalOpen, loginWithGoogle]);

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLoginModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 bg-background rounded-xl shadow-2xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Đăng nhập</h2>
          <button
            onClick={closeLoginModal}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-6">
          <p className="text-sm text-muted-foreground text-center">
            Đăng nhập để lưu lịch sử xem phim của bạn
          </p>

          {/* Google Button */}
          <div ref={googleButtonRef} />

          {isSubmitting ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground text-center">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
