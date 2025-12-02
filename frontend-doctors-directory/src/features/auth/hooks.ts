import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchCurrentUser,
  login,
  loginWithGoogle,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  resendVerificationEmail,
  type AuthSuccessPayload,
  type LoginPayload,
  type RegisterPayload,
  type SocialLoginPayload,
  type UpdatePasswordPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from '@/features/auth/api'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { User } from '@/types/user'
import { persistAuthToken, clearAuthToken } from '@/lib/http'
import { useNavigate } from 'react-router-dom'

export const useAuthQuery = () => {
  return useQuery<User | null>({
    queryKey: queryKeys.auth,
    queryFn: fetchCurrentUser,
    retry: false,
  })
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: handleAuthState,
  })

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: handleAuthState,
  })

export const useGoogleSocialAuth = () =>
  useMutation({
    mutationFn: (payload: SocialLoginPayload) => loginWithGoogle(payload),
    onSuccess: handleAuthState,
  })

export const useLogoutMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      clearAuthToken()
      queryClient.removeQueries({ queryKey: queryKeys.auth })
      navigate('/', { replace: true })
    },
  })
}

export const useUpdatePasswordMutation = () =>
  useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
  })

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => requestPasswordReset(payload),
  })

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  })

export const useResendEmailVerificationMutation = () =>
  useMutation({
    mutationFn: () => resendVerificationEmail(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })

const handleAuthState = ({ user, token }: AuthSuccessPayload) => {
  persistAuthToken(token)
  queryClient.setQueryData(queryKeys.auth, user)
}
