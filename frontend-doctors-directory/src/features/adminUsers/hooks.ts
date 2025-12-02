import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import {
  deleteAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUserStatus,
} from '@/features/adminUsers/api'
import type { AdminUserFilters } from '@/features/adminUsers/types'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { User } from '@/types/user'

export const useAdminUsersQuery = (filters: AdminUserFilters = {}) => {
  const keyFilters = { ...filters } as Record<string, unknown>
  return useQuery({
    queryKey: queryKeys.adminUsers(keyFilters),
    queryFn: () => fetchAdminUsers(filters),
    placeholderData: keepPreviousData,
  })
}

export const useAdminUserStatusMutation = () =>
  useMutation({
    mutationFn: ({ userId, disabled }: { userId: number; disabled: boolean }) =>
      updateAdminUserStatus(userId, disabled),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'], exact: false })
      queryClient.setQueryData<User | null>(queryKeys.auth, (prev) => {
        if (prev && prev.id === updatedUser.id) {
          return { ...prev, is_disabled: updatedUser.is_disabled }
        }
        return prev
      })
    },
  })

export const useAdminUserResetPasswordMutation = () =>
  useMutation({
    mutationFn: (userId: number) => resetAdminUserPassword(userId),
  })

export const useAdminUserDeleteMutation = () =>
  useMutation({
    mutationFn: (userId: number) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'], exact: false })
    },
  })
