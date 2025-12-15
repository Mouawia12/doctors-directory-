import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchNewsletterSubscriptions, subscribeToNewsletter } from '@/features/newsletter/api'
import { queryKeys } from '@/lib/queryKeys'

export const useNewsletterSubscribe = () => {
  return useMutation({
    mutationFn: ({ email, source }: { email: string; source?: string | null }) =>
      subscribeToNewsletter(email, source),
  })
}

export const useAdminNewsletterQuery = (page = 1, perPage = 25) => {
  return useQuery({
    queryKey: queryKeys.adminNewsletter({ page, perPage }),
    queryFn: () => fetchNewsletterSubscriptions(page, perPage),
  })
}
