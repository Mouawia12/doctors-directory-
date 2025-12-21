import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import {
  useAdminUserDeleteMutation,
  useAdminUsersQuery,
  useCreateAdminUserMutation,
} from '@/features/adminUsers/hooks'
import type { AdminUserFilters } from '@/features/adminUsers/types'
import { Search, ShieldCheck, Trash2, Plus } from 'lucide-react'
import type { User } from '@/types/user'

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY HH:mm') : '—')

export const AdminAdminsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10
  const [formState, setFormState] = useState({ name: '', email: '', password: '' })

  const filters: AdminUserFilters = useMemo(
    () => ({
      role: 'admin',
      q: search.trim() || undefined,
      status: 'all',
      page,
      perPage,
    }),
    [search, page, perPage],
  )

  const adminsQuery = useAdminUsersQuery(filters)
  const createMutation = useCreateAdminUserMutation()
  const deleteMutation = useAdminUserDeleteMutation()

  const admins = adminsQuery.data?.items ?? []
  const pagination = adminsQuery.data?.pagination

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.name.trim() || !formState.email.trim() || !formState.password.trim()) {
      toast.error(t('adminAdmins.form.missing'))
      return
    }

    createMutation.mutate(formState, {
      onSuccess: () => {
        toast.success(t('adminAdmins.toasts.createSuccess'))
        setFormState({ name: '', email: '', password: '' })
      },
      onError: () => toast.error(t('adminAdmins.toasts.createError')),
    })
  }

  const handleDelete = (user: User) => {
    if (!window.confirm(t('adminAdmins.confirmDelete', { name: user.name }))) return
    deleteMutation.mutate(user.id, {
      onSuccess: () => toast.success(t('adminAdmins.toasts.deleteSuccess')),
      onError: () => toast.error(t('adminAdmins.toasts.deleteError')),
    })
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t('adminAdmins.title')}</p>
            <p className="text-sm text-slate-500">{t('adminAdmins.description')}</p>
          </div>
          <ShieldCheck className="h-6 w-6 text-primary-600" />
        </div>

        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleCreate}>
          <Input
            required
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={t('adminAdmins.form.name')}
          />
          <Input
            required
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            placeholder={t('adminAdmins.form.email')}
          />
          <div className="flex gap-2">
            <Input
              required
              type="password"
              value={formState.password}
              onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
              placeholder={t('adminAdmins.form.password')}
            />
            <Button type="submit" disabled={createMutation.isPending} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              {t('adminAdmins.form.submit')}
            </Button>
          </div>
        </form>
        <p className="text-xs text-slate-500">{t('adminAdmins.form.helper')}</p>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">{t('adminAdmins.listTitle')}</p>
            <p className="text-xs text-slate-500">
              {t('adminAdmins.total', { count: pagination?.total ?? admins.length })}
            </p>
          </div>
          <div className="relative">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={t('adminAdmins.searchPlaceholder')}
              className="w-full rounded-2xl border-slate-200 bg-slate-50 pr-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {adminsQuery.isLoading ? (
          <p className="text-sm text-slate-500">{t('adminAdmins.loading')}</p>
        ) : admins.length === 0 ? (
          <EmptyState
            title={t('adminAdmins.emptyTitle')}
            description={t('adminAdmins.emptyDescription')}
          />
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{admin.name}</p>
                    <Badge variant="success" className="rounded-full text-xs">
                      {t('adminLayout.nav.admins')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{admin.email}</p>
                  <p className="text-xs text-slate-500">
                    {t('adminAdmins.createdAt')}: {formatDate(admin.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(admin)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('adminAdmins.delete')}
                  </Button>
                </div>
              </div>
            ))}
            {pagination && (
              <Pagination
                page={pagination.page}
                perPage={pagination.per_page}
                total={pagination.total}
                onChange={setPage}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminAdminsPage
