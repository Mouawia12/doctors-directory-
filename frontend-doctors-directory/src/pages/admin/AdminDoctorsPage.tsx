import { useMemo, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { Filter, Plus, Search } from 'lucide-react'
import {
  useAdminDoctors,
  useAdminDoctorModeration,
  useDeleteAdminDoctor,
} from '@/features/admin/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Card } from '@/components/ui/Card'
import type { DoctorStatus, Doctor } from '@/types/doctor'
import { useLocaleText } from '@/app/hooks/useLocaleText'

const formatDate = (value?: string, translate?: ReturnType<typeof useLocaleText>) =>
  value ? dayjs(value).format(translate?.('DD MMM YYYY', 'DD MMM YYYY') || 'DD MMM YYYY') : translate?.('—', '—') || '—'

export const AdminDoctorsPage = () => {
  const translate = useLocaleText()
  const navigate = useNavigate()
  const [status, setStatus] = useState<DoctorStatus | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const statusFilters: { label: string; value: DoctorStatus | 'all' }[] = [
    { label: translate('الكل', 'All'), value: 'all' },
    { label: translate('قيد المراجعة', 'Pending'), value: 'pending' },
    { label: translate('المعتمدون', 'Approved'), value: 'approved' },
    { label: translate('المرفوضون', 'Rejected'), value: 'rejected' },
  ]

  const filters = useMemo(
    () => ({
      status,
      q: search.trim() || undefined,
      page,
      perPage,
    }),
    [status, search, page, perPage],
  )

  const { data, isLoading, isFetching } = useAdminDoctors(filters)
  const moderationMutation = useAdminDoctorModeration()
  const deleteMutation = useDeleteAdminDoctor()

  const doctors = data?.items ?? []
  const pagination = data?.pagination

  const handleModeration = (doctor: Doctor, action: 'approve' | 'reject') => {
    let note: string | undefined

    if (action === 'reject') {
      note = window.prompt(translate('أدخل سبب الرفض (اختياري)؟', 'Enter rejection reason (optional)')) ?? undefined
    }

    moderationMutation.mutate(
      { doctorId: doctor.id, action, note },
      {
        onSuccess: () =>
          toast.success(
            action === 'approve'
              ? translate('تم اعتماد الطبيب', 'Doctor approved')
              : translate('تم رفض الطلب وتحديث الحالة', 'Request rejected and status updated'),
          ),
        onError: () => toast.error(translate('تعذر تحديث حالة الطبيب', 'Failed to update doctor status')),
      },
    )
  }

  const handleDelete = (doctor: Doctor) => {
    const confirmed = window.confirm(
      translate(`هل أنت متأكد من حذف ${doctor.full_name}؟ لا يمكن التراجع.`, `Delete ${doctor.full_name}? This cannot be undone.`),
    )
    if (!confirmed) return
    deleteMutation.mutate(doctor.id, {
      onSuccess: () => toast.success(translate('تم حذف الطبيب', 'Doctor deleted')),
      onError: () => toast.error(translate('تعذر حذف الطبيب', 'Unable to delete doctor')),
    })
  }

  const onChangeStatus = (next: DoctorStatus | 'all') => {
    setStatus(next)
    setPage(1)
  }

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeStatus(option.value)}
                className={`rounded-full px-4 py-1.5 transition ${
                  status === option.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => navigate('/admin/doctors/new')}
            className="flex w-full items-center justify-center gap-2 lg:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{translate('إضافة طبيب', 'Add doctor')}</span>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto] md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={onSearchChange}
                placeholder={translate('ابحث باسم الطبيب، التخصص أو رقم الهاتف', 'Search by doctor, specialty, or phone')}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 pr-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {search && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:text-primary-600 sm:w-32"
              >
                {translate('مسح', 'Clear')}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            {isFetching ? translate('يتم تحديث النتائج...', 'Refreshing results...') : translate('إجمالي:', 'Total:')}{' '}
            {data?.pagination.total ?? 0}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="text-sm text-slate-500">{translate('جارٍ تحميل قائمة الأطباء...', 'Loading doctors...')}</Card>
      ) : doctors.length === 0 ? (
        <EmptyState
          title={translate('لا يوجد أطباء حالياً بهذه المعايير', 'No doctors match these filters')}
          description={translate('جرّب تغيير حالة التصفية أو البحث.', 'Try adjusting the filters or search query.')}
        />
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-slate-900">{doctor.full_name}</p>
                    <StatusBadge status={doctor.status} />
                    {doctor.is_verified && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {translate('موثق', 'Verified')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{doctor.specialty}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>
                      {translate('آخر تحديث', 'Updated')}:{' '}
                      {formatDate(doctor.updated_at, translate)}
                    </span>
                    {doctor.city && <span>{translate('المدينة', 'City')}: {doctor.city}</span>}
                    {doctor.phone && <span>{translate('الهاتف', 'Phone')}: {doctor.phone}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
                  >
                    {translate('عرض الملف', 'View profile')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}
                  >
                    {translate('تعديل', 'Edit')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    disabled={moderationMutation.isPending}
                    onClick={() => handleModeration(doctor, 'reject')}
                  >
                    {translate('رفض', 'Reject')}
                  </Button>
                  <Button
                    className="flex-1 min-w-[120px]"
                    disabled={moderationMutation.isPending}
                    onClick={() => handleModeration(doctor, 'approve')}
                  >
                    {translate('اعتماد', 'Approve')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 min-w-[120px] text-rose-600 hover:bg-rose-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(doctor)}
                  >
                    {translate('حذف', 'Delete')}
                  </Button>
                </div>
              </div>
              {doctor.status_note && (
                <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{doctor.status_note}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.per_page}
          total={pagination.total}
          onChange={setPage}
        />
      )}
    </div>
  )
}

export default AdminDoctorsPage
