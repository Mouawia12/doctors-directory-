import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { useTranslation } from 'react-i18next'
import { PhoneNumber } from '@/components/common/PhoneNumber'
import { formatSpecialtyList } from '@/lib/doctor'

const formatDate = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY') : '—'

export const AdminDoctorsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<DoctorStatus | 'all'>('pending')
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsKey = searchParams.toString()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1)
  const perPage = 10

  const statusFilters: { label: string; value: DoctorStatus | 'all' }[] = [
    { label: t('adminDoctors.filters.all'), value: 'all' },
    { label: t('adminDoctors.filters.draft'), value: 'draft' },
    { label: t('adminDoctors.filters.pending'), value: 'pending' },
    { label: t('adminDoctors.filters.approved'), value: 'approved' },
    { label: t('adminDoctors.filters.rejected'), value: 'rejected' },
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

  useEffect(() => {
    const paramSearch = searchParams.get('q') ?? ''
    setSearch(paramSearch)
    const paramPage = Number(searchParams.get('page') ?? '1') || 1
    setPage(paramPage)
  }, [paramsKey])

  const { data, isLoading, isFetching } = useAdminDoctors(filters)
  const moderationMutation = useAdminDoctorModeration()
  const deleteMutation = useDeleteAdminDoctor()

  const doctors = data?.items ?? []
  const pagination = data?.pagination

  const handleModeration = (doctor: Doctor, action: 'approve' | 'reject') => {
    let note: string | undefined

    if (action === 'reject') {
      note = window.prompt(t('adminDoctors.confirmReject')) ?? undefined
    }

    moderationMutation.mutate(
      { doctorId: doctor.id, action, note },
      {
        onSuccess: () =>
          toast.success(
            action === 'approve'
              ? t('adminDoctors.approveSuccess')
              : t('adminDoctors.rejectSuccess'),
          ),
        onError: () => toast.error(t('adminDoctors.moderationError')),
      },
    )
  }

  const handleDelete = (doctor: Doctor) => {
    const confirmed = window.confirm(
      t('adminDoctors.confirmDelete', { name: doctor.full_name }),
    )
    if (!confirmed) return
    deleteMutation.mutate(doctor.id, {
      onSuccess: () => toast.success(t('adminDoctors.deleteSuccess')),
      onError: () => toast.error(t('adminDoctors.deleteError')),
    })
  }

  const onChangeStatus = (next: DoctorStatus | 'all') => {
    setStatus(next)
    setPage(1)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(1)
    const nextParams = new URLSearchParams(searchParams)
    if (event.target.value.trim()) {
      nextParams.set('q', event.target.value)
    } else {
      nextParams.delete('q')
    }
    nextParams.delete('page')
    setSearchParams(nextParams)
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
            <span>{t('adminDoctors.addDoctor')}</span>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto] md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={onSearchChange}
                placeholder={t('adminDoctors.searchPlaceholder')}
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
                  const nextParams = new URLSearchParams(searchParams)
                  nextParams.delete('q')
                  nextParams.delete('page')
                  setSearchParams(nextParams)
                }}
                className="justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:text-primary-600 sm:w-32"
              >
                {t('common.actions.clear')}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            {isFetching ? t('adminDoctors.updating') : t('adminDoctors.total')}{' '}
            {data?.pagination.total ?? 0}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="text-sm text-slate-500">{t('adminDoctors.loading')}</Card>
      ) : doctors.length === 0 ? (
        <EmptyState
          title={t('adminDoctors.emptyTitle')}
          description={t('adminDoctors.emptyCopy')}
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
                        {t('doctorProfile.verified')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatSpecialtyList(doctor.specialty, t('common.comma')) || '—'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>
                      {t('adminDoctors.lastUpdated')}: {formatDate(doctor.updated_at)}
                    </span>
                    {doctor.city && <span>{t('adminDoctors.city')}: {doctor.city}</span>}
                    {doctor.phone && (
                      <span>
                        {t('adminDoctors.phone')}: <PhoneNumber value={doctor.phone} className="text-slate-900" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
                  >
                    {t('adminDoctors.viewProfile')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}
                  >
                    {t('adminDoctors.edit')}
                  </Button>
                  {doctor.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      className="flex-1 min-w-[120px]"
                      disabled={moderationMutation.isPending}
                      onClick={() => handleModeration(doctor, 'reject')}
                    >
                      {t('adminDoctors.reject')}
                    </Button>
                  )}
                  {doctor.status !== 'approved' && (
                    <Button
                      className="flex-1 min-w-[120px]"
                      disabled={moderationMutation.isPending}
                      onClick={() => handleModeration(doctor, 'approve')}
                    >
                      {t('adminDoctors.approve')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1 min-w-[120px] text-rose-600 hover:bg-rose-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(doctor)}
                  >
                    {t('adminDoctors.delete')}
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
          onChange={(nextPage) => {
            setPage(nextPage)
            const nextParams = new URLSearchParams(searchParams)
            if (nextPage > 1) {
              nextParams.set('page', String(nextPage))
            } else {
              nextParams.delete('page')
            }
            setSearchParams(nextParams)
          }}
        />
      )}
    </div>
  )
}

export default AdminDoctorsPage
