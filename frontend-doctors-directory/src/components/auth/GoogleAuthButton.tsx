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
  const [buttonWidth, setButtonWidth] = useState('240')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { t, i18n } = useTranslation()
  const resolvedLabel = label ?? t('googleAuth.defaultLabel')

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    const el = containerRef.current
    const computeWidth = () => {
      const available = el.clientWidth - 24
      const clamped = Math.min(320, Math.max(220, available))
      setButtonWidth(String(clamped))
    }

    if (!('ResizeObserver' in window)) {
      computeWidth()
      return
    }

    const resizeObserver = new window.ResizeObserver(computeWidth)
    resizeObserver.observe(el)
    computeWidth()
    return () => resizeObserver.disconnect()
  }, [])

  if (!env.googleClientId) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        <span>{resolvedLabel}</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-inner"
        >
          <div className="flex justify-center">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleAuthButton
