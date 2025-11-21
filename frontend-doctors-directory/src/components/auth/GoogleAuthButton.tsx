import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import { env } from '@/lib/env'
import { useGoogleSocialAuth } from '@/features/auth/hooks'
import type { AuthSuccessPayload } from '@/features/auth/api'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface GoogleAuthButtonProps {
  type?: 'doctor' | 'user'
  onSuccess: (payload: AuthSuccessPayload) => void
  label?: string
  className?: string
}

export const GoogleAuthButton = ({ type, onSuccess, label, className }: GoogleAuthButtonProps) => {
  const mutation = useGoogleSocialAuth()
  const [buttonWidth, setButtonWidth] = useState('0')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { t, i18n } = useTranslation()
  const resolvedLabel = label ?? t('googleAuth.defaultLabel')

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    const el = containerRef.current
    const computeWidth = () => {
      const available = el.clientWidth - 16 // account for inner padding
      const clamped = Math.min(320, Math.max(220, available))
      setButtonWidth(String(clamped))
    }
    const resizeObserver = new ResizeObserver(computeWidth)
    resizeObserver.observe(el)
    computeWidth()
    return () => resizeObserver.disconnect()
  }, [])

  if (!env.googleClientId) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-center text-xs text-slate-500">{resolvedLabel}</p>
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="flex w-full max-w-sm items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-inner"
        >
          {buttonWidth !== '0' && (
            <GoogleLogin
              width={buttonWidth}
              locale={i18n.language}
              shape="pill"
              theme="outline"
              text="signin_with"
              onSuccess={(response) => {
                if (!response.credential) {
                  toast.error(t('googleAuth.parseError'))
                  return
                }
                mutation.mutate(
                  { token: response.credential, type },
                  {
                    onSuccess,
                    onError: (error) => {
                      const message =
                        (error as Record<string, any>)?.response?.data?.message ?? t('googleAuth.loginError')
                      toast.error(message)
                    },
                  },
                )
              }}
              onError={() => toast.error(t('googleAuth.connectionError'))}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleAuthButton
