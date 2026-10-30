import apiClient from "../../lib/apiClient";
import type NotificationPage from "./types/notificationPage";
import type NotificationResponse from "./types/notificationResponse";

export async function getNotifications(page: number): Promise<NotificationPage> {
  const response = await apiClient.get<NotificationPage>("/notifications", {
    params: { page },
  });
  return response.data;
}

export async function markNotificationRead(
  notificationId: number,
): Promise<NotificationResponse> {
  const response = await apiClient.patch<NotificationResponse>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}
