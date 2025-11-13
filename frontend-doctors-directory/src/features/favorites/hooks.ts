import { useMutation, useQuery, type QueryKey } from '@tanstack/react-query'
import { fetchFavorites, addFavorite, removeFavorite } from '@/features/favorites/api'
import { queryKeys } from '@/lib/queryKeys'
import { queryClient } from '@/lib/queryClient'
import type { ApiPagination } from '@/types/api'
import type { Doctor } from '@/types/doctor'

export const useFavoritesQuery = () =>
  useQuery({
    queryKey: queryKeys.favorites,
    queryFn: fetchFavorites,
  })

type DoctorsListResponse = { items: Doctor[]; pagination: ApiPagination }
type DoctorsQueriesSnapshot = Array<[QueryKey, DoctorsListResponse | undefined]>

interface ToggleContext {
  previousDoctors?: DoctorsQueriesSnapshot
  previousFavorites?: DoctorsListResponse
}

export const useToggleFavorite = () =>
  useMutation({
    mutationFn: async ({ doctorId, active }: { doctorId: number; active: boolean }) => {
      if (active) {
        await removeFavorite(doctorId)
      } else {
        await addFavorite(doctorId)
      }
    },
    onMutate: async ({ doctorId, active }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['doctors'], exact: false }),
        queryClient.cancelQueries({ queryKey: queryKeys.favorites }),
      ])

      const previousDoctors = queryClient.getQueriesData<DoctorsListResponse>({ queryKey: ['doctors'] })
      const previousFavorites = queryClient.getQueryData<DoctorsListResponse>(queryKeys.favorites)

      let updatedDoctor: Doctor | undefined

      queryClient.setQueriesData<DoctorsListResponse>(
        { queryKey: ['doctors'] },
        (data) => {
          if (!data) return data
          const items = data.items.map((doctor) => {
            if (doctor.id !== doctorId) return doctor
            updatedDoctor = { ...doctor, is_favorite: !active }
            return updatedDoctor
          })
          return { ...data, items }
        },
      )

      queryClient.setQueryData<DoctorsListResponse | undefined>(queryKeys.favorites, (data) => {
        if (!data) return data
        if (active) {
          return { ...data, items: data.items.filter((doctor) => doctor.id !== doctorId) }
        }
        if (!updatedDoctor) return data
        if (data.items.some((doctor) => doctor.id === doctorId)) {
          return data
        }
        return { ...data, items: [...data.items, updatedDoctor] }
      })

      return { previousDoctors, previousFavorites } satisfies ToggleContext
    },
    onError: (_error, _variables, context) => {
      context?.previousDoctors?.forEach(([queryKey, snapshot]) => {
        queryClient.setQueryData(queryKey, snapshot)
      })
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites, context.previousFavorites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
      queryClient.invalidateQueries({ queryKey: ['doctors'], exact: false })
    },
  })
