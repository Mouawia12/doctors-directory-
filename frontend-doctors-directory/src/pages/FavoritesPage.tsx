import { useFavoritesQuery } from '@/features/favorites/hooks'
import { DoctorCard } from '@/components/common/DoctorCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useTranslation } from 'react-i18next'

export const FavoritesPage = () => {
  const { data, isLoading } = useFavoritesQuery()
  const items = data?.items ?? []
  const { t } = useTranslation()

  if (isLoading) {
    return <div className="container text-slate-500">{t('favorites.loading')}</div>
  }

  return (
    <div className="container space-y-4">
      <div>
        <p className="text-xs text-slate-500">{t('favorites.listLabel')}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{t('favorites.title')}</h1>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={t('favorites.emptyTitle')}
          description={t('favorites.emptyDescription')}
        />
      ) : (
        <div className="grid gap-4">
          {items.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
