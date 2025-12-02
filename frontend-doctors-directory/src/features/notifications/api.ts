import { api } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type { Notification } from '@/features/notifications/types'

export interface NotificationsResponse {
  items: Notification[]
  pagination: {
    page: number
    per_page: number
    total: number
  }
}

export const fetchNotifications = async () => {
  const { data } = await api.get<ApiListResponse<Notification[]>>('/api/notifications')
  return data.data
}

export const markNotificationRead = async (notificationId: string) => {
  await api.post<ApiResponse<Notification>>(`/api/notifications/${notificationId}/read`)
}
