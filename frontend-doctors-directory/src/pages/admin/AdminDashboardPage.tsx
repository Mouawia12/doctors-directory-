import { Activity, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useAdminDoctors } from '@/features/admin/hooks'
import { DoctorCard } from '@/components/common/DoctorCard'
import { Card } from '@/components/ui/Card'
import { useLocaleText } from '@/app/hooks/useLocaleText'

export const AdminDashboardPage = () => {
  const translate = useLocaleText()
  const pending = useAdminDoctors({ status: 'pending', perPage: 3 })
  const approved = useAdminDoctors({ status: 'approved', perPage: 3 })
  const rejected = useAdminDoctors({ status: 'rejected', perPage: 3 })

  const stats = [
    {
      label: translate('قيد المراجعة', 'Pending'),
      value: pending.data?.pagination.total ?? 0,
      icon: Clock3,
      badge: translate('ينتظر المتابعة', 'Requires attention'),
      chipBg: 'bg-amber-50',
      chipText: 'text-amber-700',
    },
    {
      label: translate('المعتمدون', 'Approved'),
      value: approved.data?.pagination.total ?? 0,
      icon: CheckCircle2,
      badge: translate('جاهز للنشر', 'Ready to publish'),
      chipBg: 'bg-emerald-50',
      chipText: 'text-emerald-700',
    },
    {
      label: translate('المرفوضون', 'Rejected'),
      value: rejected.data?.pagination.total ?? 0,
      icon: XCircle,
      badge: translate('بحاجة لتعديل', 'Needs revision'),
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
              {translate('أحدث الطلبات قيد المراجعة', 'Latest pending requests')}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {pending.data?.pagination.total ?? 0}{' '}
              {translate('طلب', 'requests')}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {pending.data?.items.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} compact profilePath={`/admin/doctors/${doctor.id}`} />
            )) || <p className="text-sm text-slate-500">{translate('لا يوجد طلبات حالياً', 'No requests yet')}</p>}
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{translate('نظرة سريعة', 'Quick glance')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{translate('مؤشرات الأداء', 'Performance')}</h3>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{translate('إجمالي الطلبات', 'Total requests')}</span>
              <span className="font-semibold text-slate-900">{totalRequests}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>{translate('نسبة الاعتماد', 'Approval rate')}</span>
              <span className="font-semibold text-emerald-600">{approvalRate}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>{translate('نسبة قيد المراجعة', 'Pending rate')}</span>
              <span className="font-semibold text-amber-600">{pendingShare}%</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-100 p-2 text-primary-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{translate('خطة العمل', 'Action plan')}</p>
                <p className="text-xs text-slate-500">
                  {translate('راجع الطلبات قيد الانتظار وحدّث الملاحظات للأطباء', 'Review pending requests and update notes')}
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
