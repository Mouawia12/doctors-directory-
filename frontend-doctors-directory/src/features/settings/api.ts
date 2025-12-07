import { api } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import type { AdminSiteSettings, SiteSettings } from '@/features/settings/types'

const SETTINGS_CACHE_KEY = 'site-settings-cache'

const writeSiteSettingsCache = (settings: SiteSettings | AdminSiteSettings) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings))
  } catch {
    // ignore storage errors
  }
}

export const getCachedSiteSettings = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY)
    return raw ? (JSON.parse(raw) as SiteSettings) : undefined
  } catch {
    return undefined
  }
}

export const fetchSiteSettings = async () => {
  const { data } = await api.get<ApiResponse<SiteSettings>>('/api/settings')
  writeSiteSettingsCache(data.data)
  return data.data
}

export const fetchAdminSiteSettings = async () => {
  const { data } = await api.get<ApiResponse<AdminSiteSettings>>('/api/admin/settings')
  writeSiteSettingsCache(data.data)
  return data.data
}

export const updateAdminSiteSettings = async (payload: FormData) => {
  const { data } = await api.post<ApiResponse<AdminSiteSettings>>('/api/admin/settings', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  writeSiteSettingsCache(data.data)
  return data.data
}

export { writeSiteSettingsCache }
