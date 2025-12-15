import { api } from '@/lib/http'
import type { ApiListResponse } from '@/types/api'

export interface NewsletterSubscription {
  id: number
  email: string
  locale?: string | null
  source?: string | null
  created_at?: string | null
}

export const subscribeToNewsletter = async (email: string, source: string | null = 'footer') => {
  await api.post('/api/newsletter', { email, source })
}

export const fetchNewsletterSubscriptions = async (page = 1, perPage = 25) => {
  const { data } = await api.get<ApiListResponse<NewsletterSubscription[]>>('/api/admin/newsletter-subscriptions', {
    params: { page, per_page: perPage },
  })

  return data.data
}
