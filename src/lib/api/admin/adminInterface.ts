export type UserRole = "user" | "admin";

export type NotificationType =
  | "comment_reply"
  | "leaderboard_overtake"
  | "rank_change"
  | "system"
  | "event";

export interface ReadByUser {
  userId: {
    _id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  readAt: string;
}

export interface AdminNotification {
  _id: string;
  userId?: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  recipients: Array<{
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  }>;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  readBy: ReadByUser[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  provider: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchHistoryItem {
  _id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  originName?: string;
  episodeCurrent?: string;
  year?: number;
  quality?: string;
  progress: number;
  duration: number;
  completed: boolean;
  currentEpSlug?: string;
  currentEpName?: string;
  source: "ophim" | "phimapi";
  watchedAt: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalUsersGrowth: number;
  activeUsers: number;
  totalComments: number;
  totalWatchHistory: number;
}

export interface Comment {
  _id: string;
  userId: {
    _id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  movieSlug: string;
  movieTitle?: string;
  text: string;
  likes: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayCheckIn {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  date: string;
  createdAt: string;
  rank: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
