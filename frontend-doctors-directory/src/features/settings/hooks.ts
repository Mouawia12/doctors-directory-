import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminSiteSettings,
  fetchSiteSettings,
  getCachedSiteSettings,
  updateAdminSiteSettings,
  writeSiteSettingsCache,
} from '@/features/settings/api'
import { queryKeys } from '@/lib/queryKeys'
import type { AdminSiteSettings, SiteSettings } from '@/features/settings/types'

export const useSiteSettingsQuery = () => {
  return useQuery<SiteSettings>({
    queryKey: queryKeys.settings,
    queryFn: fetchSiteSettings,
    initialData: getCachedSiteSettings(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export const useAdminSiteSettingsQuery = () => {
  return useQuery<AdminSiteSettings>({
    queryKey: queryKeys.adminSettings,
    queryFn: fetchAdminSiteSettings,
  })
}

export const useUpdateAdminSiteSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAdminSiteSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.adminSettings, data)
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      writeSiteSettingsCache(data)
    },
  })
}
