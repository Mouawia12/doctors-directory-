import { Button } from '@/components/ui/Button'
import { useAuthQuery, useResendEmailVerificationMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLocation } from 'react-router-dom'

export const EmailVerificationBanner = () => {
  const { data: user, status } = useAuthQuery()
  const resendMutation = useResendEmailVerificationMutation()
  const { t } = useTranslation()
  const location = useLocation()

  const hiddenRoutes = ['/verify-email', '/verify-email/success']
  const shouldHide = hiddenRoutes.some((route) => location.pathname.startsWith(route))

  if (status === 'pending' || shouldHide || !user || user.email_verified_at) {
    return null
  }

  const handleResend = () => {
    resendMutation.mutate(undefined, {
      onSuccess: () => toast.success(t('auth.verification.banner.success')),
      onError: () => toast.error(t('auth.verification.banner.error')),
    })
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="container flex flex-col gap-3 py-3 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{t('auth.verification.banner.title')}</p>
          <p className="text-xs md:text-sm">{t('auth.verification.banner.description')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-amber-300 text-amber-900 hover:bg-amber-100 md:w-auto"
          disabled={resendMutation.isPending}
          onClick={handleResend}
        >
          {resendMutation.isPending ? t('auth.verification.banner.sending') : t('auth.verification.banner.resend')}
        </Button>
      </div>
    </div>
  )
}
