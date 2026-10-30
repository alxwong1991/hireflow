export default interface NotificationResponse {
  id: number;
  message: string;
  targetPath: string;
  createdAt: string;
  read: boolean;
}
