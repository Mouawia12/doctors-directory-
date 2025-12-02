import { Button } from '@/components/ui/Button'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const allowedStatuses = ['verified', 'already-verified', 'invalid-link'] as const
type VerificationStatus = (typeof allowedStatuses)[number]

const EmailVerificationSuccessPage = () => {
  const [params] = useSearchParams()
  const { t } = useTranslation()
  const paramStatus = params.get('status')
  const status: VerificationStatus = allowedStatuses.includes(paramStatus as VerificationStatus)
    ? (paramStatus as VerificationStatus)
    : 'verified'

  const titleMap: Record<VerificationStatus, string> = {
    'verified': t('auth.verification.success.verifiedTitle'),
    'already-verified': t('auth.verification.success.alreadyTitle'),
    'invalid-link': t('auth.verification.success.invalidTitle'),
  }

  const descriptionMap: Record<VerificationStatus, string> = {
    'verified': t('auth.verification.success.verifiedDescription'),
    'already-verified': t('auth.verification.success.alreadyDescription'),
    'invalid-link': t('auth.verification.success.invalidDescription'),
  }

  const primaryCta =
    status === 'invalid-link'
      ? { to: '/verify-email', label: t('auth.verification.success.requestNew') }
      : { to: '/auth/login', label: t('auth.verification.success.goToLogin') }

  return (
    <div className="space-y-5 text-center">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{titleMap[status]}</h2>
        <p className="text-sm text-slate-500">{descriptionMap[status]}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link to={primaryCta.to}>{primaryCta.label}</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/">{t('auth.verification.success.goHome')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default EmailVerificationSuccessPage
