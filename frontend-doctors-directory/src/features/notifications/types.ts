export interface NotificationData {
  title: string
  message: string
  status: string
  note?: string | null
}

export interface Notification {
  id: string
  type: string
  data: NotificationData
  read_at: string | null
  created_at: string
}
