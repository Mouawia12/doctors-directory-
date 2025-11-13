import { useFavoritesQuery } from '@/features/favorites/hooks'
import { DoctorCard } from '@/components/common/DoctorCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useLocaleText } from '@/app/hooks/useLocaleText'

export const FavoritesPage = () => {
  const { data, isLoading } = useFavoritesQuery()
  const items = data?.items ?? []
  const translate = useLocaleText()

  if (isLoading) {
    return <div className="container text-slate-500">{translate('جارٍ تحميل المفضلة...', 'Loading favorites...')}</div>
  }

  return (
    <div className="container space-y-4">
      <div>
        <p className="text-xs text-slate-500">{translate('قائمتك', 'Your list')}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{translate('الأطباء المفضلون', 'Favorite doctors')}</h1>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={translate('لا توجد أطباء في المفضلة', 'No doctors in favorites yet')}
          description={translate('ابدأ بإضافة الأطباء الذين تود متابعتهم لاحقاً.', 'Start adding doctors you want to follow later.')}
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
