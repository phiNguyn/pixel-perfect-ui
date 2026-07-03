import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "./notificationApi";

export const NOTIFICATION_QUERY_KEY = ["notifications"] as const;

export const useQueryNotifications = (
  page = 1,
  limit = 20,
  unreadOnly = false,
  enabled = true,
) => {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, "list", page, limit, unreadOnly],
    queryFn: () => notificationApi.getNotifications(page, limit, unreadOnly),
    enabled,
    staleTime: 30_000,
  });
};

export const useQueryUnreadNotificationCount = (enabled = true) => {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled,
    staleTime: 15_000,
    refetchInterval: enabled ? 60_000 : false,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
};
