"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Zap, Lightbulb, Bug, Film, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feedbackApi } from "@/lib/api/feedback/feedbackApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { getSessionId } from "@/lib/utils/sessionTracker";
import { FeedbackCategory, FEEDBACK_CATEGORIES } from "@/lib/api/feedback/feedbackInterface";
import { Badge } from "@/components/ui/badge";

interface FeedbackChatbotProps {
  source?: "floating" | "button";
}

export default function FeedbackChatbot({ source = "floating" }: FeedbackChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"category" | "form">("category");
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, tokens, user } = useAuthStore();
  const accessToken = tokens?.accessToken;

  const handleCategorySelect = (category: FeedbackCategory) => {
    setSelectedCategory(category);
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      let userEmail = email;
      if (isAuthenticated && user?.email) {
        userEmail = user.email;
      }

      const result = await feedbackApi.submit(
        {
          category: selectedCategory!,
          subject: subject.trim(),
          content: content.trim(),
          email: userEmail || undefined,
        },
        accessToken || undefined
      );

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setStep("category");
          setSelectedCategory(null);
          setSubject("");
          setContent("");
          setEmail("");
          setSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Submit feedback error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep("category");
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Floating Button */}
      {source === "floating" && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Gửi phản hồi"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          {/* Header */}
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base">Phản hồi</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Gửi ý kiến cho Pinuss Team
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Cảm ơn bạn!</h3>
                <p className="text-sm text-muted-foreground">
                  Chúng tôi đã nhận được phản hồi của bạn và sẽ cải thiện sớm nhất có thể.
                </p>
              </div>
            ) : step === "category" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Bạn muốn phản hồi về vấn đề gì?
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <CategoryButton
                    icon={<Bug className="w-5 h-5" />}
                    label="Báo lỗi"
                    description="Phát hiện lỗi trên website"
                    onClick={() => handleCategorySelect("bug_report")}
                  />
                  <CategoryButton
                    icon={<Lightbulb className="w-5 h-5" />}
                    label="Đề xuất tính năng"
                    description="Ý tưởng cải thiện Pinuss"
                    onClick={() => handleCategorySelect("feature_request")}
                  />
                  <CategoryButton
                    icon={<Zap className="w-5 h-5" />}
                    label="Cải thiện"
                    description="Cải thiện trải nghiệm"
                    onClick={() => handleCategorySelect("improvement")}
                  />
                  <CategoryButton
                    icon={<Film className="w-5 h-5" />}
                    label="Yêu cầu thêm phim"
                    description="Phim bạn muốn xem"
                    onClick={() => handleCategorySelect("content_request")}
                  />
                  <CategoryButton
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="Khác"
                    description="Các vấn đề khác"
                    onClick={() => handleCategorySelect("other")}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-8 w-8">
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {FEEDBACK_CATEGORIES[selectedCategory!]?.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
                    <Input
                      placeholder="Mô tả ngắn gọn..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {subject.length}/200
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Chi tiết</label>
                    <Textarea
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px]"
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {content.length}/5000
                    </p>
                  </div>

                  {!isAuthenticated && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Email (tùy chọn)
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Để lại email để nhận phản hồi từ chúng tôi
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!subject.trim() || !content.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gửi phản hồi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
