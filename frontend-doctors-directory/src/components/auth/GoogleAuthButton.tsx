import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { useGoogleSocialAuth } from '@/features/auth/hooks'
import type { AuthSuccessPayload } from '@/features/auth/api'
import { cn } from '@/lib/utils'

interface GoogleAuthButtonProps {
  type?: 'doctor' | 'user'
  onSuccess: (payload: AuthSuccessPayload) => void
  label?: string
  className?: string
}

export const GoogleAuthButton = ({ type, onSuccess, label = 'أو تابع باستخدام حساب Google', className }: GoogleAuthButtonProps) => {
  const mutation = useGoogleSocialAuth()

  if (!env.googleClientId) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-center text-xs text-slate-500">{label}</p>
      <div className="flex justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
          <GoogleLogin
            width="100%"
            locale="ar"
            shape="pill"
            theme="outline"
            text="signin_with"
            onSuccess={(response) => {
              if (!response.credential) {
                toast.error('لم نستطع قراءة بيانات Google')
                return
              }
              mutation.mutate(
                { token: response.credential, type },
                {
                  onSuccess,
                  onError: (error) => {
                    const message =
                      (error as Record<string, any>)?.response?.data?.message ?? 'تعذر تسجيل الدخول عبر Google'
                    toast.error(message)
                  },
                },
              )
            }}
            onError={() => toast.error('تعذر الاتصال بخدمات Google')}
          />
        </div>
      </div>
    </div>
  )
}

export default GoogleAuthButton
