import { Activity, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useAdminDoctors } from '@/features/admin/hooks'
import { DoctorCard } from '@/components/common/DoctorCard'
import { Card } from '@/components/ui/Card'
import { useTranslation } from 'react-i18next'

export const AdminDashboardPage = () => {
  const { t } = useTranslation()
  const pending = useAdminDoctors({ status: 'pending', perPage: 3 })
  const approved = useAdminDoctors({ status: 'approved', perPage: 3 })
  const rejected = useAdminDoctors({ status: 'rejected', perPage: 3 })

  const stats = [
    {
      label: t('adminDashboard.pending'),
      value: pending.data?.pagination.total ?? 0,
      icon: Clock3,
      badge: t('adminDashboard.needsAttention'),
      chipBg: 'bg-amber-50',
      chipText: 'text-amber-700',
    },
    {
      label: t('adminDashboard.approved'),
      value: approved.data?.pagination.total ?? 0,
      icon: CheckCircle2,
      badge: t('adminDashboard.ready'),
      chipBg: 'bg-emerald-50',
      chipText: 'text-emerald-700',
    },
    {
      label: t('adminDashboard.rejected'),
      value: rejected.data?.pagination.total ?? 0,
      icon: XCircle,
      badge: t('adminDashboard.needsRevision'),
      chipBg: 'bg-rose-50',
      chipText: 'text-rose-700',
    },
  ]

  const totalRequests = stats.reduce((sum, stat) => sum + stat.value, 0)
  const approvalRate =
    totalRequests > 0 ? Math.round(((approved.data?.pagination.total ?? 0) / totalRequests) * 100) : 0
  const pendingShare =
    totalRequests > 0 ? Math.round(((pending.data?.pagination.total ?? 0) / totalRequests) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.chipBg} ${stat.chipText}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{stat.badge}</p>
              <p className="text-lg font-semibold text-slate-900">{stat.label}</p>
            </div>
            <div className="ml-auto text-3xl font-bold text-slate-900">{stat.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('adminDashboard.latest')}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {pending.data?.pagination.total ?? 0}{' '}
              {t('adminDashboard.requests')}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {pending.data?.items.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} compact profilePath={`/admin/doctors/${doctor.id}`} />
            )) || <p className="text-sm text-slate-500">{t('adminDashboard.none')}</p>}
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{t('adminDashboard.quickGlance')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDashboard.performance')}</h3>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{t('adminDashboard.totalRequests')}</span>
              <span className="font-semibold text-slate-900">{totalRequests}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>{t('adminDashboard.approvalRate')}</span>
              <span className="font-semibold text-emerald-600">{approvalRate}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>{t('adminDashboard.pendingRate')}</span>
              <span className="font-semibold text-amber-600">{pendingShare}%</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-100 p-2 text-primary-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{t('adminDashboard.actionPlan')}</p>
                <p className="text-xs text-slate-500">
                  {t('adminDashboard.actionCopy')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage
