import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/features/categories/api'
import { queryKeys } from '@/lib/queryKeys'

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  })
