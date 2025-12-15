import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useAdminNewsletterQuery } from '@/features/newsletter/hooks'
import { Pagination } from '@/components/common/Pagination'

const PER_PAGE = 25

export const AdminNewsletterPage = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminNewsletterQuery(page, PER_PAGE)

  const items = data?.items ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('adminNewsletter.title')}</h1>
        <p className="text-sm text-slate-500">{t('adminNewsletter.description')}</p>
      </div>

      <Card>
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">{t('adminNewsletter.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-700">{t('adminNewsletter.email')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">{t('adminNewsletter.locale')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">{t('adminNewsletter.source')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">{t('adminNewsletter.createdAt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 font-medium text-slate-900">{item.email}</td>
                    <td className="px-4 py-2 text-slate-600">{item.locale ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{item.source ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{item.created_at ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && (
        <div className="flex justify-end">
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.per_page}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

export default AdminNewsletterPage
