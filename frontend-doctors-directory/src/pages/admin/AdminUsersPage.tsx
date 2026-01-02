import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/common/Pagination'
import { useAdminUserDeleteMutation, useAdminUserResetPasswordMutation, useAdminUserStatusMutation, useAdminUsersQuery } from '@/features/adminUsers/hooks'
import type { AdminUserFilters } from '@/features/adminUsers/types'
import type { User } from '@/types/user'
import { useTranslation } from 'react-i18next'
import { Filter, RefreshCcw, Search, Shield, Trash2, UserMinus, UserPlus, Users } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatSpecialtyList } from '@/lib/doctor'

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY HH:mm') : '—')

const roleOptions = ['all', 'user', 'doctor', 'admin'] as const
type RoleFilter = (typeof roleOptions)[number]
type StatusFilter = 'all' | 'active' | 'disabled'

export const AdminUsersPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>((searchParams.get('role') as RoleFilter) ?? 'all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) ?? 'all',
  )
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1)
  const perPage = 15

  const syncKey = searchParams.toString()
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
    setRoleFilter((searchParams.get('role') as RoleFilter) ?? 'all')
    setStatusFilter((searchParams.get('status') as StatusFilter) ?? 'all')
    setPage(Number(searchParams.get('page') ?? '1') || 1)
  }, [syncKey])

  const filters: AdminUserFilters = useMemo(
    () => ({
      q: search.trim() || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      status: statusFilter,
      page,
      perPage,
    }),
    [search, roleFilter, statusFilter, page, perPage],
  )

  const usersQuery = useAdminUsersQuery(filters)
  const statusMutation = useAdminUserStatusMutation()
  const resetMutation = useAdminUserResetPasswordMutation()
  const deleteMutation = useAdminUserDeleteMutation()

  const users = usersQuery.data?.items ?? []
  const pagination = usersQuery.data?.pagination

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    next.delete('page')
    setSearchParams(next)
  }

  const updateFilterParams = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page')
    setSearchParams(next)
  }

  const handleRoleFilter = (value: RoleFilter) => {
    setRoleFilter(value)
    setPage(1)
    updateFilterParams('role', value === 'all' ? null : value)
  }

  const handleStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
    updateFilterParams('status', value === 'all' ? null : value)
  }

  const handleToggleStatus = (user: User) => {
    const nextState = !user.is_disabled
    statusMutation.mutate(
      { userId: user.id, disabled: nextState },
      {
        onSuccess: () => {
          toast.success(
            nextState ? t('adminUsers.toasts.disabledSuccess') : t('adminUsers.toasts.enabledSuccess'),
          )
        },
        onError: () => toast.error(t('adminUsers.toasts.statusError')),
      },
    )
  }

  const handleResetPassword = (user: User) => {
    resetMutation.mutate(user.id, {
      onSuccess: () => toast.success(t('adminUsers.toasts.resetSuccess')),
      onError: () => toast.error(t('adminUsers.toasts.resetError')),
    })
  }

  const handleDelete = (user: User) => {
    if (!window.confirm(t('adminUsers.confirmDelete', { name: user.name }))) return
    deleteMutation.mutate(user.id, {
      onSuccess: () => toast.success(t('adminUsers.toasts.deleteSuccess')),
      onError: () => toast.error(t('adminUsers.toasts.deleteError')),
    })
  }

  const roleLabels: Record<RoleFilter, string> = {
    all: t('adminUsers.filters.roles.all'),
    user: t('adminUsers.filters.roles.user'),
    doctor: t('adminUsers.filters.roles.doctor'),
    admin: t('adminUsers.filters.roles.admin'),
  }

  const statusLabels: Record<StatusFilter, string> = {
    all: t('adminUsers.filters.status.all'),
    active: t('adminUsers.filters.status.active'),
    disabled: t('adminUsers.filters.status.disabled'),
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
          <div className="relative">
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t('adminUsers.searchPlaceholder')}
              className="w-full rounded-2xl border-slate-200 bg-slate-50 pr-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            {usersQuery.isFetching ? t('adminUsers.updating') : t('adminUsers.resultsCount', { count: pagination?.total ?? 0 })}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">{t('adminUsers.filters.rolesLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleRoleFilter(option)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    roleFilter === option ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {roleLabels[option]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              {t('adminUsers.filters.statusLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'disabled'] as StatusFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleStatusFilter(option)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    statusFilter === option ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {statusLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {usersQuery.isLoading ? (
        <Card className="text-sm text-slate-500">{t('adminUsers.loading')}</Card>
      ) : users.length === 0 ? (
        <EmptyState title={t('adminUsers.emptyTitle')} description={t('adminUsers.emptyDescription')} />
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        user.is_disabled ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.is_disabled ? t('adminUsers.status.disabled') : t('adminUsers.status.active')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>
                      {t('adminUsers.meta.created')}: {formatDate(user.created_at)}
                    </span>
                    <span>
                      {t('adminUsers.meta.lastLogin')}: {formatDate(user.last_login_at)}
                    </span>
                    <span>
                      {t('adminUsers.meta.favorites')}: {user.favorites_count ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.roles?.map((role) => (
                      <Badge key={role} className="rounded-full border border-slate-200 px-3 py-1 text-xs capitalize">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={resetMutation.isPending}
                    onClick={() => handleResetPassword(user)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t('adminUsers.actions.resetPassword')}
                  </Button>
                  <Button
                    type="button"
                    variant={user.is_disabled ? 'outline' : 'ghost'}
                    className={user.is_disabled ? '' : 'text-amber-600 hover:bg-amber-50'}
                    disabled={statusMutation.isPending}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.is_disabled ? (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {t('adminUsers.actions.enable')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4" />
                        {t('adminUsers.actions.disable')}
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('adminUsers.actions.delete')}
                  </Button>
                </div>
              </div>

              {user.doctor_profile && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Shield className="h-5 w-5 text-primary-500" />
                    <p className="text-sm font-semibold text-slate-800">
                      {t('adminUsers.doctorProfile.title', { name: user.doctor_profile.full_name })}
                    </p>
                    <StatusBadge status={user.doctor_profile.status} />
                    {user.doctor_profile.is_verified && (
                      <Badge variant="success">{t('adminUsers.doctorProfile.verified')}</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      {t('adminUsers.doctorProfile.specialty')}:{' '}
                      {formatSpecialtyList(user.doctor_profile.specialty, t('common.comma')) || '—'}
                    </span>
                    <a
                      href={`/admin/doctors/${user.doctor_profile.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {t('adminUsers.doctorProfile.view')}
                    </a>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users className="h-4 w-4" />
                  {t('adminUsers.favorites.title')}
                </div>
                {user.favorites && user.favorites.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {user.favorites.map((favorite) => (
                      <li key={favorite.id} className="flex flex-wrap items-center gap-2">
                        <span>{favorite.doctor?.full_name ?? t('adminUsers.favorites.unknownDoctor')}</span>
                        {favorite.doctor && (
                          <a
                            href={`/doctors/${favorite.doctor.id}`}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            {t('adminUsers.favorites.viewPublic')}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">{t('adminUsers.favorites.empty')}</p>
                )}
              </div>
            </Card>
          ))}
          {pagination && (
            <Pagination
              page={pagination.page}
              perPage={pagination.per_page}
              total={pagination.total}
              onChange={(nextPage) => {
                setPage(nextPage)
                const next = new URLSearchParams(searchParams)
                next.set('page', String(nextPage))
                setSearchParams(next)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
