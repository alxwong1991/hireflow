import type { QueryClient } from "@tanstack/react-query";
import type { UserRole } from "../auth/types/userRole";
import type NotificationResponse from "./types/notificationResponse";
import type { NotificationsData } from "./notificationQueries";

export function unreadBadgeText(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function unreadCountLabel(count: number): string {
  return `Notifications, ${count} unread`;
}

export function isNotificationTargetValid(
  targetPath: string,
  role: UserRole,
): boolean {
  // Notifications can only navigate to known role-specific pages, never an arbitrary server-provided URL.
  return role === "EMPLOYEE"
    ? /^\/employee\/(?:applications#application-\d+|messages\/[1-9]\d*)$/.test(targetPath)
    : /^\/employer\/(?:jobs\/\d+\/applications|messages\/[1-9]\d*)$/.test(targetPath);
}

export function updateNotificationRead(
  data: NotificationsData | undefined,
  updated: NotificationResponse,
): NotificationsData | undefined {
  if (!data) return data;
  let wasUnread = false;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => {
      if (item.id !== updated.id) return item;
      wasUnread = !item.read;
      return updated;
    }),
  }));
  // The API returns the unread count per page; decrement only when this mutation changed unread to read.
  return {
    ...data,
    pages: pages.map((page, index) =>
      index === 0 && wasUnread
        ? { ...page, unreadCount: Math.max(0, page.unreadCount - 1) }
        : page,
    ),
  };
}

export function removeNotification(
  data: NotificationsData | undefined,
  notificationId: number,
): NotificationsData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== notificationId),
    })),
  };
}

export function invalidateTargetQueries(
  queryClient: QueryClient,
  targetPath: string,
  role: UserRole,
): Promise<void>[] {
  if (new RegExp(`^/${role.toLowerCase()}/messages/[1-9]\\d*$`).test(targetPath)) {
    return [queryClient.invalidateQueries({ queryKey: ["chats"] })];
  }
  if (role === "EMPLOYEE" && targetPath.startsWith("/employee/applications")) {
    return [queryClient.invalidateQueries({ queryKey: ["applications", "employee"] })];
  }

  const employerJobMatch = targetPath.match(
    /^\/employer\/jobs\/(\d+)\/applications(?:\/|$)/,
  );
  if (role === "EMPLOYER" && employerJobMatch) {
    const jobId = Number(employerJobMatch[1]);
    return [
      queryClient.invalidateQueries({
        queryKey: ["applications", "employer", jobId],
      }),
      queryClient.invalidateQueries({ queryKey: ["jobs", jobId] }),
    ];
  }
  return [];
}
