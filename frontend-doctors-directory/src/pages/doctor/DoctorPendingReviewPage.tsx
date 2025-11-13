import { useNavigate } from 'react-router-dom'
import { useLocaleText } from '@/app/hooks/useLocaleText'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/admin/StatusBadge'

export const DoctorPendingReviewPage = () => {
  const { data: user } = useAuthQuery()
  const navigate = useNavigate()
  const logout = useLogoutMutation()
  const translate = useLocaleText()
  const status = user?.doctor_profile?.status ?? 'pending'

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] w-full items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-slate-100" />
      <div className="absolute -left-10 top-12 h-48 w-48 rounded-full bg-primary-100/30 blur-[90px]" />
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-100/40 blur-[120px]" />
      <div className="max-w-3xl space-y-8 rounded-[32px] border border-white/70 bg-white/80 p-10 text-center shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-600 shadow-inner">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 6Zm1 11h-2v-7h2v7Z" />
            </svg>
          </div>
          <StatusBadge status={status} />
          <h1 className="text-3xl font-bold text-slate-900">
            {translate('حسابك قيد المراجعة', 'Your profile is under review')}
          </h1>
          <p className="text-base leading-7 text-slate-500">
            {translate(
              'راجع بياناتك وتأكّد من مطابقة الوثائق مع المعلومات الرسمية. سنخبرك فور اعتماد الملف.',
              'Please double-check your data. We will notify you once the profile gets approved.',
            )}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:justify-center">
          <Button className="rounded-full px-6 py-3" onClick={() => navigate('/doctor/profile')}>
            {translate('تعديل ملفي', 'Edit my profile')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
            disabled={logout.isPending}
            className="rounded-full px-6 py-3 text-slate-500 hover:bg-slate-100"
          >
            {logout.isPending ? translate('جارٍ تسجيل الخروج...', 'Signing out...') : translate('تسجيل الخروج', 'Logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DoctorPendingReviewPage
