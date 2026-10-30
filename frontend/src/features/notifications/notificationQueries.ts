import { useInfiniteQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { UserRole } from "../auth/types/userRole";
import { getNotifications } from "./notificationApi";
import type NotificationPage from "./types/notificationPage";

export const notificationsQueryKey = (email: string, role: UserRole) =>
  ["notifications", email, role] as const;

export type NotificationsQueryKey = ReturnType<typeof notificationsQueryKey>;
export type NotificationsData = InfiniteData<NotificationPage, number>;

export function useNotifications(email: string, role: UserRole) {
  return useInfiniteQuery({
    // Keep each account's notification cache separate; the first page also supplies the unread badge count.
    queryKey: notificationsQueryKey(email, role),
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
