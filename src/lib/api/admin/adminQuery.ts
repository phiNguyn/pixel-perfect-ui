import { useQuery } from "@tanstack/react-query"
import { adminApi } from "./adminApi"
import { QueryResult } from "@/hooks/useQueryResult"

export const useAdminQueryStats = (accessToken: string) => { 
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: () => adminApi.getStats(accessToken),
        staleTime : 5 * 60 * 1000,
        gcTime : 10 * 60 * 1000,
        retry : false,
    })
}

export const useAdminQueryUsers = (accessToken: string, query : QueryResult) => {
    return useQuery({
      queryKey: ["admin", "users", JSON.stringify(query) ],
      queryFn: () => adminApi.getUsers(accessToken, query),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    });
}

export const useAdminQueryComments = (accessToken: string, query : QueryResult) => { 
    return useQuery({
        queryKey: ["admin", "comments", JSON.stringify(query) ],
        queryFn: () => adminApi.getComments(accessToken, query),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
    });
}
export const useAdminQueryWatchHistory = (accessToken: string, userId: string, query : QueryResult) => {
    return useQuery({
        queryKey: ["admin", "watch-history", userId, JSON.stringify(query) ],
        queryFn: () => adminApi.getUserWatchHistory(userId, accessToken, query),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
    });
}