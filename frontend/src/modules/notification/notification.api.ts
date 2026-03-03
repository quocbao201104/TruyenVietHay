import axios from "@/utils/axios";

// Notification type constants (matches backend NOTIF_TYPE)
export const NOTIF_TYPE = {
  SYSTEM: 1,
  NEW_CHAPTER: 2,
  APPROVAL: 3,
} as const;

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  is_read: 0 | 1;
  type: number;
  target_id: number | null;
  created_at: string;
}

export interface NotificationResponse {
  success: true;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const getNotificationsApi = async (page = 1, limit = 10): Promise<NotificationResponse> => {
  const response = await axios.get('/api/notifications', {
    params: { page, limit }
  });
  return response.data;
};

export const markAsReadApi = async (id: number): Promise<void> => {
  await axios.put(`/api/notifications/${id}/read`);
};

export const markAllAsReadApi = async (): Promise<void> => {
  await axios.put('/api/notifications/read-all');
};
