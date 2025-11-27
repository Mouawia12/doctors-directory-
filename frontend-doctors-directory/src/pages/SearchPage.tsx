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
import { useTranslation } from 'react-i18next'

const languageOptions = ['ar', 'en', 'fr']

export const SearchPage = () => {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '1')
  const { t } = useTranslation()

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
    q: t('searchPage.filters.keywords'),
    city: t('searchPage.filters.city'),
    specialty: t('searchPage.filters.specialty'),
    min_exp: t('searchPage.filters.years'),
  }

  const cityOptions = [
    { value: '', label: t('searchPage.options.allCities') },
    { value: t('searchPage.options.riyadh'), label: t('searchPage.options.riyadh') },
    { value: t('searchPage.options.jeddah'), label: t('searchPage.options.jeddah') },
    { value: t('searchPage.options.dubai'), label: t('searchPage.options.dubai') },
    { value: t('searchPage.options.doha'), label: t('searchPage.options.doha') },
    { value: t('searchPage.options.cairo'), label: t('searchPage.options.cairo') },
  ]

  const specialtyOptions = [
    { value: '', label: t('searchPage.options.allSpecialties') },
    { value: t('searchPage.options.individualTherapy'), label: t('searchPage.options.individualTherapy') },
    { value: t('searchPage.options.familyTherapy'), label: t('searchPage.options.familyTherapy') },
    { value: t('searchPage.options.cbt'), label: t('searchPage.options.cbt') },
    { value: t('searchPage.options.addiction'), label: t('searchPage.options.addiction') },
    { value: t('searchPage.options.childhood'), label: t('searchPage.options.childhood') },
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
  const mapMarkers = useMemo(
    () =>
      doctors
        .filter((doctor) => doctor.lat && doctor.lng)
        .map((doctor) => ({
          lat: doctor.lat as number,
          lng: doctor.lng as number,
          title: doctor.full_name,
        })),
    [doctors],
  )

  return (
    <div className="container grid gap-8 lg:grid-cols-[320px,1fr] lg:items-start">
      <aside className="flex h-fit flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card lg:sticky lg:top-24">
        <div>
          <label className="text-xs text-slate-500">{t('searchPage.filters.keywords')}</label>
          <Input
            value={filters.q}
            placeholder={t('searchPage.form.keywordsPlaceholder')}
            onChange={(event) => handleFilterChange('q', event.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('searchPage.filters.city')}</label>
          <Select value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('searchPage.filters.specialty')}</label>
          <Select value={filters.specialty} onChange={(e) => handleFilterChange('specialty', e.target.value)}>
            {specialtyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('searchPage.filters.years')}</label>
          <Input
            type="number"
            min={0}
            value={filters.min_exp ?? ''}
            onChange={(event) => handleFilterChange('min_exp', event.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('searchPage.filters.languages')}</label>
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
          {t('searchPage.filters.mediaOnly')}
        </label>
      </aside>

      <section className="space-y-4">
        {mapMarkers.length > 0 && (
          <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="text-sm font-semibold text-slate-800">{t('searchPage.results.mapTitle')}</p>
            <MapWidget markers={mapMarkers} className="h-72 w-full rounded-2xl border border-slate-100" />
          </div>
        )}
        <FilterChips filters={activeFilters} onRemove={removeFilter} labels={filterLabels} />
        {isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
            {t('searchPage.results.loading')}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title={t('searchPage.results.emptyTitle')}
            description={t('searchPage.results.emptyDescription')}
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
          </>
        )}
      </section>
    </div>
  )
}

export default SearchPage
