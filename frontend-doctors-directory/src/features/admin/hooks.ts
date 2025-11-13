import { useMemo } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import {
  approveDoctor,
  createAdminDoctor,
  createCategory,
  deleteAdminDoctor,
  deleteCategory,
  fetchAdminDoctor,
  fetchAdminDoctors,
  rejectDoctor,
  updateAdminDoctor,
  updateCategory,
} from '@/features/admin/api'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { AdminDoctorFilters, AdminDoctorPayload } from '@/features/admin/types'
import type { Doctor } from '@/types/doctor'

export const useAdminDoctors = (filters: AdminDoctorFilters = {}) => {
  const { status, page, perPage, q } = filters
  const normalizedFilters = useMemo(
    () => ({
      status: status && status !== 'all' ? status : undefined,
      page: page ?? 1,
      perPage: perPage ?? 10,
      q: q?.trim() || undefined,
    }),
    [status, page, perPage, q],
  )

  return useQuery<{ items: Doctor[]; pagination: { page: number; per_page: number; total: number } }>({
    queryKey: queryKeys.adminDoctors(normalizedFilters),
    queryFn: () => fetchAdminDoctors(normalizedFilters),
    placeholderData: keepPreviousData,
  })
}

export const useAdminDoctorQuery = (doctorId?: string | number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: doctorId ? queryKeys.adminDoctor(doctorId) : queryKeys.adminDoctor('new'),
    queryFn: () => fetchAdminDoctor(doctorId as string | number),
    enabled: Boolean(doctorId) && (options?.enabled ?? true),
  })

export const useAdminDoctorModeration = () =>
  useMutation({
    mutationFn: ({ doctorId, action, note }: { doctorId: number; action: 'approve' | 'reject'; note?: string }) => {
      if (action === 'approve') return approveDoctor(doctorId)
      return rejectDoctor(doctorId, note)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'], exact: false })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDoctor(variables.doctorId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor(variables.doctorId) })
    },
  })

export const useCreateAdminDoctor = () =>
  useMutation({
    mutationFn: (payload: AdminDoctorPayload) => createAdminDoctor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'], exact: false })
    },
  })

export const useUpdateAdminDoctor = () =>
  useMutation({
    mutationFn: ({ doctorId, payload }: { doctorId: number; payload: AdminDoctorPayload }) =>
      updateAdminDoctor(doctorId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'], exact: false })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDoctor(variables.doctorId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor(variables.doctorId) })
    },
  })

export const useDeleteAdminDoctor = () =>
  useMutation({
    mutationFn: (doctorId: number) => deleteAdminDoctor(doctorId),
    onSuccess: (_data, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'], exact: false })
      queryClient.removeQueries({ queryKey: queryKeys.adminDoctor(doctorId) })
      queryClient.removeQueries({ queryKey: queryKeys.doctor(doctorId) })
    },
  })

export const useCategoryMutations = () =>
  useMutation({
    mutationFn: async ({
      type,
      payload,
      categoryId,
    }: {
      type: 'create' | 'update' | 'delete'
      payload?: { name?: string; slug?: string; parent_id?: number | null }
      categoryId?: number
    }) => {
      if (type === 'create') {
        await createCategory(payload ?? {})
        return
      }

      if (type === 'update' && categoryId) {
        await updateCategory(categoryId, payload ?? {})
        return
      }

      if (type === 'delete' && categoryId) {
        await deleteCategory(categoryId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    },
  })
