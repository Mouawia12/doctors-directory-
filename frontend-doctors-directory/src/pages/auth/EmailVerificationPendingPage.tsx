import { Button } from '@/components/ui/Button'
import { useAuthQuery, useResendEmailVerificationMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Link, Navigate } from 'react-router-dom'

const EmailVerificationPendingPage = () => {
  const { data: user, status } = useAuthQuery()
  const resendMutation = useResendEmailVerificationMutation()
  const { t } = useTranslation()

  if (status === 'pending') {
    return <div className="text-center text-sm text-slate-500">{t('common.loading')}</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (user.email_verified_at) {
    return <Navigate to="/" replace />
  }

  const handleResend = () => {
    resendMutation.mutate(undefined, {
      onSuccess: () => toast.success(t('auth.verification.pending.resent')),
      onError: () => toast.error(t('auth.verification.pending.error')),
    })
  }

  return (
    <div className="space-y-5 text-center">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{t('auth.verification.pending.heading')}</h2>
        <p className="text-sm text-slate-500">
          {t('auth.verification.pending.description', { email: user.email })}
        </p>
      </div>
      <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
        <p>{t('auth.verification.pending.instructions')}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="button" className="w-full" disabled={resendMutation.isPending} onClick={handleResend}>
          {resendMutation.isPending
            ? t('auth.verification.pending.sending')
            : t('auth.verification.pending.resend')}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/">{t('auth.verification.pending.goHome')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default EmailVerificationPendingPage
