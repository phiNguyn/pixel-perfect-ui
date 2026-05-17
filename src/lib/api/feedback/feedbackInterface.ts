export type FeedbackCategory =
  | "bug_report"
  | "feature_request"
  | "improvement"
  | "content_request"
  | "other";

export type FeedbackStatus =
  | "pending"
  | "in_progress"
  | "resolved"
  | "rejected";

export type FeedbackPriority = "low" | "medium" | "high";

export interface Feedback {
  _id: string;
  userId?: {
    _id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  sessionId?: string;
  email?: string;
  category: FeedbackCategory;
  subject: string;
  content: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  adminReply?: string;
  repliedBy?: {
    _id: string;
    name?: string;
    email: string;
  };
  repliedAt?: string;
  metadata?: {
    userAgent?: string;
    pageUrl?: string;
    movieSlug?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  category: FeedbackCategory;
  subject: string;
  content: string;
  email?: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const FEEDBACK_CATEGORIES: Record<FeedbackCategory, { label: string; emoji: string }> = {
  bug_report: { label: "Báo lỗi", emoji: "🐛" },
  feature_request: { label: "Đề xuất tính năng", emoji: "💡" },
  improvement: { label: "Cải thiện", emoji: "⚡" },
  content_request: { label: "Yêu cầu thêm phim", emoji: "🎬" },
  other: { label: "Khác", emoji: "💭" },
};

export const FEEDBACK_STATUS: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-500" },
  in_progress: { label: "Đang xử lý", color: "bg-blue-500" },
  resolved: { label: "Đã xử lý", color: "bg-green-500" },
  rejected: { label: "Từ chối", color: "bg-red-500" },
};
