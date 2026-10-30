import type NotificationResponse from "./notificationResponse";

export default interface NotificationPage {
  items: NotificationResponse[];
  unreadCount: number;
  hasMore: boolean;
}
