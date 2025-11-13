import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDoctorsQuery } from '@/features/doctors/hooks'
import { useFavoritesQuery } from '@/features/favorites/hooks'
import { DoctorCard } from '@/components/common/DoctorCard'
import { FilterChips } from '@/components/common/FilterChips'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { MapWidget } from '@/components/common/MapWidget'
import { useLocaleText } from '@/app/hooks/useLocaleText'

const languageOptions = ['ar', 'en', 'fr']

export const SearchPage = () => {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '1')
  const translate = useLocaleText()

  const filters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      city: params.get('city') ?? '',
      specialty: params.get('specialty') ?? '',
      min_exp: params.get('min_exp') ? Number(params.get('min_exp')) : undefined,
      has_media: params.has('has_media') ? params.get('has_media') === 'true' : undefined,
      languages: params.getAll('languages'),
      page,
      per_page: 10,
    }),
    [params, page],
  )

  const { data, isLoading } = useDoctorsQuery(filters)
  const { data: favoritesData } = useFavoritesQuery()
  const favoriteIds = useMemo(
    () => (favoritesData ? new Set(favoritesData.items.map((doctor) => doctor.id)) : null),
    [favoritesData],
  )

  const handleFilterChange = (key: string, value?: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.set('page', '1')
    setParams(next)
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    const next = new URLSearchParams(params)
    if (checked) {
      next.set(name, 'true')
    } else {
      next.delete(name)
    }
    setParams(next)
  }

  const handleLanguageToggle = (lang: string) => {
    const next = new URLSearchParams(params)
    const current = new Set(next.getAll('languages'))
    if (current.has(lang)) {
      current.delete(lang)
    } else {
      current.add(lang)
    }
    next.delete('languages')
    current.forEach((value) => next.append('languages', value))
    setParams(next)
  }

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(params)
    next.delete(key)
    setParams(next)
  }

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  const activeFilters = {
    q: filters.q,
    city: filters.city,
    specialty: filters.specialty,
    min_exp: filters.min_exp,
  }

  const filterLabels = {
    q: translate('كلمات مفتاحية', 'Keywords'),
    city: translate('المدينة', 'City'),
    specialty: translate('التخصص', 'Specialty'),
    min_exp: translate('سنوات الخبرة', 'Experience (years)'),
  }

  const cityOptions = [
    { value: '', label: translate('كل المدن', 'All cities') },
    { value: 'الرياض', label: translate('الرياض', 'Riyadh') },
    { value: 'جدة', label: translate('جدة', 'Jeddah') },
    { value: 'دبي', label: translate('دبي', 'Dubai') },
    { value: 'الدوحة', label: translate('الدوحة', 'Doha') },
    { value: 'القاهرة', label: translate('القاهرة', 'Cairo') },
  ]

  const specialtyOptions = [
    { value: '', label: translate('كل التخصصات', 'All specialties') },
    { value: 'العلاج الفردي', label: translate('العلاج الفردي', 'Individual therapy') },
    { value: 'العلاج الأسري والزوجي', label: translate('العلاج الأسري والزوجي', 'Family & couples therapy') },
    { value: 'العلاج السلوكي المعرفي', label: translate('العلاج السلوكي المعرفي', 'Cognitive behavioral therapy') },
    { value: 'علاج الإدمان', label: translate('علاج الإدمان', 'Addiction counseling') },
    { value: 'اضطرابات الطفولة', label: translate('اضطرابات الطفولة', 'Child & adolescent therapy') },
  ]

  const doctors = useMemo(() => {
    const items = data?.items ?? []
    if (!favoriteIds) return items
    return items.map((doctor) => ({
      ...doctor,
      is_favorite: favoriteIds.has(doctor.id),
    }))
  }, [data, favoriteIds])
  const pagination = data?.pagination

  return (
    <div className="container grid gap-8 lg:grid-cols-[320px,1fr] lg:items-start">
      <aside className="flex h-fit flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card lg:sticky lg:top-24">
        <div>
          <label className="text-xs text-slate-500">{translate('كلمات مفتاحية', 'Keywords')}</label>
          <Input value={filters.q} onChange={(event) => handleFilterChange('q', event.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">{translate('المدينة', 'City')}</label>
          <Select value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">{translate('التخصص', 'Specialty')}</label>
          <Select value={filters.specialty} onChange={(e) => handleFilterChange('specialty', e.target.value)}>
            {specialtyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">{translate('عدد سنوات الخبرة', 'Years of experience')}</label>
          <Input
            type="number"
            min={0}
            value={filters.min_exp ?? ''}
            onChange={(event) => handleFilterChange('min_exp', event.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{translate('اللغات', 'Languages')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {languageOptions.map((lang) => (
              <button
                key={lang}
                className={`rounded-full px-3 py-1 text-xs ${
                  filters.languages?.includes(lang) ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => handleLanguageToggle(lang)}
                type="button"
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={filters.has_media} onChange={(event) => handleCheckboxChange('has_media', event.target.checked)} />
          {translate('عرض الأطباء الذين لديهم وسائط', 'Show doctors with media')}
        </label>
      </aside>

      <section className="space-y-4">
        <FilterChips filters={activeFilters} onRemove={removeFilter} labels={filterLabels} />
        {isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
            {translate('جارٍ تحميل النتائج...', 'Loading results...')}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title={translate('لا يوجد أطباء يطابقون البحث', 'No doctors matched your search')}
            description={translate('حاول تعديل الفلاتر للحصول على نتائج أكثر.', 'Try adjusting the filters to get more results.')}
          />
        ) : (
          <>
            <div className="grid gap-4">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            {pagination && (
              <Pagination
                page={pagination.page}
                perPage={pagination.per_page}
                total={pagination.total}
                onChange={updatePage}
              />
            )}
            <div className="mt-8">
              <MapWidget
                markers={doctors
                  .filter((doctor) => doctor.lat && doctor.lng)
                  .map((doctor) => ({
                    lat: doctor.lat as number,
                    lng: doctor.lng as number,
                    title: doctor.full_name,
                  }))}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default SearchPage
