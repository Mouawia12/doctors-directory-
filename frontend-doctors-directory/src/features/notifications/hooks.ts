import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchNotifications, markNotificationRead } from '@/features/notifications/api'
import { queryKeys } from '@/lib/queryKeys'
import { queryClient } from '@/lib/queryClient'

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
  })

export const useMarkNotificationRead = () =>
  useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
