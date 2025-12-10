import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { useDoctorsQuery } from '@/features/doctors/hooks'
import { useFavoritesQuery } from '@/features/favorites/hooks'
import { useCategoriesQuery } from '@/features/categories/hooks'
import { therapyModalityOptions } from '@/data/therapyModalities'
import { therapySpecialties } from '@/data/therapySpecialties'
import type { Category } from '@/types/doctor'
import { DoctorCard } from '@/components/common/DoctorCard'
import { FilterChips, type FilterChipItem } from '@/components/common/FilterChips'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { MapWidget } from '@/components/common/MapWidget'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { languageLabel } from '@/lib/language'

const languageOptions = ['ar', 'en']
const ageGroupValues = ['kids', 'teens', 'adults'] as const
const sessionTypeValues = ['in_person', 'online', 'hybrid'] as const
type SessionType = (typeof sessionTypeValues)[number]

const flattenCategories = (tree: Category[] = [], depth = 0): Array<Category & { depth: number }> => {
  return tree.flatMap((category) => [
    { ...category, depth },
    ...(category.children ? flattenCategories(category.children, depth + 1) : []),
  ])
}

const FilterSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
    {children}
  </div>
)

interface CollapsibleFilterProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

const CollapsibleFilter = ({ title, isOpen, onToggle, children }: CollapsibleFilterProps) => (
  <div className="rounded-2xl border border-slate-100">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-start"
      aria-expanded={isOpen}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
      <ChevronDown
        className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
    <div className={`px-4 pb-4 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="pt-2">{children}</div>
    </div>
  </div>
)

const normalizeLanguageValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized.startsWith('ar')) {
    return 'ar'
  }
  if (normalized.startsWith('en')) {
    return 'en'
  }
  return normalized
}

const parseNumberParam = (value: string | null) => {
  if (value === null) return undefined
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const SearchPage = () => {
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') ?? '1') || 1, 1)
  const { t, i18n } = useTranslation()
  const [insuranceInput, setInsuranceInput] = useState('')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [openFilters, setOpenFilters] = useState(() => ({
    issues: params.getAll('issues').length > 0,
    therapy: params.getAll('therapy_modalities').length > 0,
  }))

  const categoriesQuery = useCategoriesQuery()
  const flattenedCategories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )
  const categoryLabelMap = useMemo(() => {
    const map = new Map<number, string>()
    flattenedCategories.forEach((category) => map.set(category.id, category.name))
    return map
  }, [flattenedCategories])

  const therapyApproachOptions = useMemo(
    () =>
      therapyModalityOptions.map((option) => ({
        value: `${option.ar} / ${option.en}`,
        label: i18n.language.startsWith('ar') ? option.ar : option.en,
      })),
    [i18n.language],
  )
  const therapyLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    therapyApproachOptions.forEach((option) => map.set(option.value, option.label))
    return map
  }, [therapyApproachOptions])

  const ageGroupOptions = useMemo(
    () =>
      ageGroupValues.map((value) => ({
        value,
        label: t(`doctorForm.clientFocus.ageOptions.${value}`),
      })),
    [t],
  )

  const sessionTypeOptions = useMemo(
    () =>
      sessionTypeValues.map((value) => ({
        value,
        label: t(`searchPage.options.sessionTypes.${value}` as const),
      })),
    [t],
  )
  const sessionTypeLabelMap = useMemo(() => {
    const map = new Map<SessionType, string>()
    sessionTypeOptions.forEach((option) => map.set(option.value, option.label))
    return map
  }, [sessionTypeOptions])

  const filters = useMemo(() => {
    const languages = params.getAll('languages')
    const issues = params
      .getAll('issues')
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value))
    const therapy = params.getAll('therapy_modalities')
    const ageGroups = params.getAll('age_groups')
    const sessionTypes = params
      .getAll('session_types')
      .filter((value): value is SessionType => sessionTypeValues.includes(value as SessionType))
    const insurances = params.getAll('insurances')
    const hasMediaParam = params.get('has_media')

    return {
      q: params.get('q') ?? '',
      city: params.get('city') ?? '',
      specialty: params.get('specialty') ?? '',
      min_exp: parseNumberParam(params.get('min_exp')),
      has_media: hasMediaParam === null ? undefined : hasMediaParam === 'true',
      languages: languages.length ? languages : undefined,
      issues: issues.length ? issues : undefined,
      therapy_modalities: therapy.length ? therapy : undefined,
      age_groups: ageGroups.length ? ageGroups : undefined,
      session_types: sessionTypes.length ? sessionTypes : undefined,
      insurances: insurances.length ? insurances : undefined,
      price_min: parseNumberParam(params.get('price_min')),
      price_max: parseNumberParam(params.get('price_max')),
      page,
      per_page: 10,
    }
  }, [params, page])

  const { data, isLoading } = useDoctorsQuery(filters)
  const { data: favoritesData } = useFavoritesQuery()
  const favoriteIds = useMemo(
    () => (favoritesData ? new Set(favoritesData.items.map((doctor) => doctor.id)) : null),
    [favoritesData],
  )

  const doctors = useMemo(() => {
    const items = data?.items ?? []
    const withFavorites = favoriteIds
      ? items.map((doctor) => ({
          ...doctor,
          is_favorite: favoriteIds.has(doctor.id),
        }))
      : items

    const selectedLanguages = filters.languages?.map(normalizeLanguageValue) ?? []
    if (selectedLanguages.length === 0) {
      return withFavorites
    }

    return withFavorites.filter((doctor) => {
      const doctorLanguages = (doctor.languages ?? []).map(normalizeLanguageValue)
      if (doctorLanguages.length !== selectedLanguages.length) {
        return false
      }
      return selectedLanguages.every((lang) => doctorLanguages.includes(lang))
    })
  }, [data, favoriteIds, filters.languages])

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

  const resetPage = (next: URLSearchParams) => {
    next.delete('page')
    next.set('page', '1')
  }

  const handleFilterChange = (key: string, value?: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    resetPage(next)
    setParams(next)
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    const next = new URLSearchParams(params)
    if (checked) {
      next.set(name, 'true')
    } else {
      next.delete(name)
    }
    resetPage(next)
    setParams(next)
  }

  const toggleArrayParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    const current = next.getAll(key)
    const exists = current.includes(value)
    next.delete(key)
    current.forEach((item) => {
      if (item !== value) {
        next.append(key, item)
      }
    })
    if (!exists) {
      next.append(key, value)
    }
    resetPage(next)
    setParams(next)
  }

  const addArrayValue = (key: string, value: string) => {
    if (!value) return
    const next = new URLSearchParams(params)
    const current = new Set(next.getAll(key))
    if (current.has(value)) {
      return
    }
    next.append(key, value)
    resetPage(next)
    setParams(next)
  }

  const removeArrayValue = (key: string, value: string | number) => {
    const next = new URLSearchParams(params)
    const target = String(value)
    const remaining = next.getAll(key).filter((entry) => entry !== target)
    next.delete(key)
    remaining.forEach((entry) => next.append(key, entry))
    resetPage(next)
    setParams(next)
  }

  const removeFilter = (key: string, value: string | number) => {
    removeArrayValue(key, value)
  }

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  const handleInsuranceAdd = () => {
    const trimmed = insuranceInput.trim()
    if (!trimmed) return
    addArrayValue('insurances', trimmed)
    setInsuranceInput('')
  }
  const handleQuickExperience = (years: number) => {
    if (filters.min_exp !== undefined && filters.min_exp >= years) {
      handleFilterChange('min_exp', '')
      return
    }
    handleFilterChange('min_exp', String(years))
  }
  const handleQuickPrice = (maxPrice: number) => {
    if (
      filters.price_max !== undefined &&
      filters.price_max <= maxPrice &&
      (filters.price_min === undefined || filters.price_min === 0)
    ) {
      handleFilterChange('price_max', '')
      return
    }
    handleFilterChange('price_max', String(maxPrice))
  }
  const toggleCollapsible = (section: 'issues' | 'therapy') => {
    setOpenFilters((prev) => ({ ...prev, [section]: !prev[section] }))
  }
  const clearAllFilters = () => {
    const next = new URLSearchParams()
    const qValue = params.get('q')
    if (qValue) {
      next.set('q', qValue)
    }
    next.set('page', '1')
    setInsuranceInput('')
    setParams(next)
  }
  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return
    }
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileFiltersOpen])

  const filterChips = useMemo<FilterChipItem[]>(() => {
    const chips: FilterChipItem[] = []
    const currency = t('common.currency')

    if (filters.q) {
      chips.push({ key: 'q', label: t('searchPage.filters.keywords'), value: filters.q })
    }
    if (filters.city) {
      chips.push({ key: 'city', label: t('searchPage.filters.city'), value: filters.city })
    }
    if (filters.specialty) {
      chips.push({ key: 'specialty', label: t('searchPage.filters.specialty'), value: filters.specialty })
    }
    if (filters.min_exp !== undefined) {
      chips.push({
        key: 'min_exp',
        label: t('searchPage.filters.years'),
        value: filters.min_exp,
      })
    }
    if (filters.has_media) {
      chips.push({
        key: 'has_media',
        label: t('searchPage.filters.mediaOnly'),
        value: 'true',
      })
    }
    ;(filters.languages ?? []).forEach((code) =>
      chips.push({
        key: 'languages',
        label: t('searchPage.filters.languages'),
        value: code,
        displayValue: languageLabel(code, t),
      }),
    )
    ;(filters.issues ?? []).forEach((issueId) =>
      chips.push({
        key: 'issues',
        label: t('searchPage.filters.issues'),
        value: issueId,
        displayValue: categoryLabelMap.get(issueId) ?? String(issueId),
      }),
    )
    ;(filters.therapy_modalities ?? []).forEach((modality) =>
      chips.push({
        key: 'therapy_modalities',
        label: t('searchPage.filters.therapyApproaches'),
        value: modality,
        displayValue: therapyLabelMap.get(modality) ?? modality,
      }),
    )
    ;(filters.age_groups ?? []).forEach((age) =>
      chips.push({
        key: 'age_groups',
        label: t('searchPage.filters.ageGroups'),
        value: age,
        displayValue: t(`doctorForm.clientFocus.ageOptions.${age}`),
      }),
    )
    ;(filters.session_types ?? []).forEach((session) =>
      chips.push({
        key: 'session_types',
        label: t('searchPage.filters.sessionTypes'),
        value: session,
        displayValue: sessionTypeLabelMap.get(session) ?? session,
      }),
    )
    if (filters.price_min !== undefined) {
      chips.push({
        key: 'price_min',
        label: t('searchPage.filters.priceRange'),
        value: filters.price_min,
        displayValue: t('searchPage.filters.priceMinChip', {
          value: filters.price_min,
          currency,
        }),
      })
    }
    if (filters.price_max !== undefined) {
      chips.push({
        key: 'price_max',
        label: t('searchPage.filters.priceRange'),
        value: filters.price_max,
        displayValue: t('searchPage.filters.priceMaxChip', {
          value: filters.price_max,
          currency,
        }),
      })
    }
    ;(filters.insurances ?? []).forEach((insurance) =>
      chips.push({
        key: 'insurances',
        label: t('searchPage.filters.insurance'),
        value: insurance,
      }),
    )

    return chips
  }, [
    categoryLabelMap,
    filters.age_groups,
    filters.city,
    filters.has_media,
    filters.insurances,
    filters.issues,
    filters.languages,
    filters.min_exp,
    filters.price_max,
    filters.price_min,
    filters.q,
    filters.session_types,
    filters.specialty,
    filters.therapy_modalities,
    sessionTypeLabelMap,
    t,
  ])
  const activeFilterCount = filterChips.length

  const cityOptions = [
    { value: '', label: t('searchPage.options.allCities') },
    { value: t('searchPage.options.riyadh'), label: t('searchPage.options.riyadh') },
    { value: t('searchPage.options.jeddah'), label: t('searchPage.options.jeddah') },
    { value: t('searchPage.options.mecca'), label: t('searchPage.options.mecca') },
    { value: t('searchPage.options.medina'), label: t('searchPage.options.medina') },
    { value: t('searchPage.options.dammam'), label: t('searchPage.options.dammam') },
    { value: t('searchPage.options.khobar'), label: t('searchPage.options.khobar') },
    { value: t('searchPage.options.dhahran'), label: t('searchPage.options.dhahran') },
    { value: t('searchPage.options.abha'), label: t('searchPage.options.abha') },
    { value: t('searchPage.options.taif'), label: t('searchPage.options.taif') },
    { value: t('searchPage.options.tabuk'), label: t('searchPage.options.tabuk') },
    { value: t('searchPage.options.qassim'), label: t('searchPage.options.qassim') },
    { value: t('searchPage.options.hail'), label: t('searchPage.options.hail') },
    { value: t('searchPage.options.najran'), label: t('searchPage.options.najran') },
    { value: t('searchPage.options.jizan'), label: t('searchPage.options.jizan') },
    { value: t('searchPage.options.baha'), label: t('searchPage.options.baha') },
    { value: t('searchPage.options.ulla'), label: t('searchPage.options.ulla') },
  ]

  const specialtyOptions = useMemo(
    () => [
      { value: '', label: t('searchPage.options.allSpecialties') },
      ...therapySpecialties.map((item) => ({
        value: item.ar,
        label: i18n.language.startsWith('ar') ? item.ar : item.en,
      })),
    ],
    [t, i18n.language],
  )

  const selectedLanguages = filters.languages ?? []
  const selectedIssues = filters.issues ?? []
  const selectedTherapyApproaches = filters.therapy_modalities ?? []
  const selectedAgeGroups = filters.age_groups ?? []
  const selectedSessionTypes = filters.session_types ?? []
  const selectedInsurances = filters.insurances ?? []
  const currencyLabel = t('common.currency')
  const experienceThreshold = 10
  const budgetThreshold = 400
  const quickNavLinks = ageGroupOptions.map((option) => ({
    key: option.value,
    label: option.label,
    active: selectedAgeGroups.includes(option.value),
    onClick: () => toggleArrayParam('age_groups', option.value),
  }))
  const quickFilterChips = [
    {
      key: 'media',
      label: t('searchPage.filters.quickFilters.media'),
      active: Boolean(filters.has_media),
      onClick: () => handleCheckboxChange('has_media', !filters.has_media),
    },
    {
      key: 'online',
      label: t('searchPage.filters.quickFilters.online'),
      active: selectedSessionTypes.includes('online'),
      onClick: () => toggleArrayParam('session_types', 'online'),
    },
    {
      key: 'arabic',
      label: t('searchPage.filters.quickFilters.arabic'),
      active: selectedLanguages.includes('ar'),
      onClick: () => toggleArrayParam('languages', 'ar'),
    },
    {
      key: 'english',
      label: t('searchPage.filters.quickFilters.english'),
      active: selectedLanguages.includes('en'),
      onClick: () => toggleArrayParam('languages', 'en'),
    },
    {
      key: 'experience',
      label: t('searchPage.filters.quickFilters.experienced', { years: experienceThreshold }),
      active: filters.min_exp !== undefined && filters.min_exp >= experienceThreshold,
      onClick: () => handleQuickExperience(experienceThreshold),
    },
    {
      key: 'budget',
      label: t('searchPage.filters.quickFilters.budget', { value: budgetThreshold, currency: currencyLabel }),
      active:
        filters.price_max !== undefined &&
        filters.price_max <= budgetThreshold &&
        (filters.price_min === undefined || filters.price_min === 0),
      onClick: () => handleQuickPrice(budgetThreshold),
    },
  ]
  const mobileFilterHelperText =
    activeFilterCount > 0
      ? t('searchPage.filters.mobile.activeCount', { count: activeFilterCount })
      : t('searchPage.filters.mobile.helper')
  const renderCoreFilters = () => (
    <div className="space-y-4">
      <FilterSection title={t('searchPage.filters.keywords')}>
        <Input
          value={filters.q}
          placeholder={t('searchPage.form.keywordsPlaceholder')}
          onChange={(event) => handleFilterChange('q', event.target.value)}
        />
      </FilterSection>
      <FilterSection title={t('searchPage.filters.city')}>
        <Select value={filters.city} onChange={(event) => handleFilterChange('city', event.target.value)}>
          {cityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterSection>
      <FilterSection title={t('searchPage.filters.specialty')}>
        <Select value={filters.specialty} onChange={(event) => handleFilterChange('specialty', event.target.value)}>
          {specialtyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterSection>
      <FilterSection title={t('searchPage.filters.years')}>
        <Input
          type="number"
          min={0}
          value={filters.min_exp ?? ''}
          onChange={(event) => handleFilterChange('min_exp', event.target.value)}
        />
      </FilterSection>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <Checkbox
          checked={Boolean(filters.has_media)}
          onChange={(event) => handleCheckboxChange('has_media', event.target.checked)}
        />
        {t('searchPage.filters.mediaOnly')}
      </label>
    </div>
  )

  const renderAdvancedFilters = () => (
    <div className="space-y-6">
        <CollapsibleFilter
          title={t('searchPage.filters.issues')}
          isOpen={openFilters.issues}
          onToggle={() => toggleCollapsible('issues')}
        >
          {categoriesQuery.isLoading ? (
            <p className="text-xs text-slate-500">{t('common.loadingShort')}</p>
          ) : flattenedCategories.length === 0 ? (
            <p className="text-xs text-slate-500">{t('searchPage.filters.noCategories')}</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {flattenedCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                  style={{ marginInlineStart: `${category.depth * 12}px` }}
                >
                  <Checkbox
                    checked={selectedIssues.includes(category.id)}
                    onChange={() => toggleArrayParam('issues', String(category.id))}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          )}
        </CollapsibleFilter>

        <CollapsibleFilter
          title={t('searchPage.filters.therapyApproaches')}
          isOpen={openFilters.therapy}
          onToggle={() => toggleCollapsible('therapy')}
        >
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1 text-sm text-slate-700">
            {therapyApproachOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTherapyApproaches.includes(option.value)}
                  onChange={() => toggleArrayParam('therapy_modalities', option.value)}
                />
                <span className="leading-snug">{option.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleFilter>

        <FilterSection title={t('searchPage.filters.ageGroups')}>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            {ageGroupOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedAgeGroups.includes(option.value)}
                  onChange={() => toggleArrayParam('age_groups', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t('searchPage.filters.languages')}>
          <div className="mt-1 flex flex-wrap gap-2">
            {languageOptions.map((lang) => (
              <button
                key={lang}
                className={`rounded-full px-3 py-1 text-xs ${
                  selectedLanguages.includes(lang)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
                onClick={() => toggleArrayParam('languages', lang)}
                type="button"
              >
                {languageLabel(lang, t)}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t('searchPage.filters.sessionTypes')}>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            {sessionTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSessionTypes.includes(option.value)}
                  onChange={() => toggleArrayParam('session_types', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t('searchPage.filters.priceRange')}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              type="number"
              min={0}
              placeholder={t('searchPage.filters.priceMinPlaceholder')}
              value={filters.price_min ?? ''}
              onChange={(event) => handleFilterChange('price_min', event.target.value)}
            />
            <Input
              type="number"
              min={0}
              placeholder={t('searchPage.filters.priceMaxPlaceholder')}
              value={filters.price_max ?? ''}
              onChange={(event) => handleFilterChange('price_max', event.target.value)}
            />
          </div>
        </FilterSection>

        <FilterSection title={t('searchPage.filters.insurance')}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={insuranceInput}
              placeholder={t('searchPage.filters.insurancePlaceholder')}
              onChange={(event) => setInsuranceInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleInsuranceAdd()
                }
              }}
            />
            <Button type="button" onClick={handleInsuranceAdd} className="w-full sm:w-auto">
              {t('searchPage.filters.addInsurance')}
            </Button>
          </div>
          {selectedInsurances.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedInsurances.map((insurance) => (
                <button
                  key={insurance}
                  type="button"
                  onClick={() => removeArrayValue('insurances', insurance)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
                >
                  {insurance} ✕
                </button>
              ))}
            </div>
          )}
        </FilterSection>
    </div>
  )

  const filterPanelContent = (
    <div className="space-y-6">
      {renderCoreFilters()}
      <div className="h-px bg-slate-100" aria-hidden="true" />
      {renderAdvancedFilters()}
    </div>
  )

  return (
    <div className="container space-y-6 lg:space-y-0">
      <div className="space-y-3 lg:hidden">
        <div className="flex gap-4 overflow-x-auto pb-1 text-xs font-semibold text-slate-500">
          {quickNavLinks.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={link.onClick}
              className={`border-b-2 pb-1 transition ${
                link.active
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto rounded-3xl border border-slate-100 bg-white px-3 py-2 shadow-card">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-primary-200 hover:text-primary-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t('searchPage.filters.mobile.triggerLabel')}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                {activeFilterCount}
              </span>
            )}
          </button>
          {quickFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClick}
              aria-pressed={chip.active}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                chip.active
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[360px,1fr] lg:items-start lg:gap-8">
        <aside className="hidden h-fit flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:flex lg:overflow-y-auto lg:pr-4">
          {filterPanelContent}
        </aside>

        <section className="space-y-4">
          {mapMarkers.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
              <p className="text-sm font-semibold text-slate-800">{t('searchPage.results.mapTitle')}</p>
              <MapWidget
                markers={mapMarkers}
                className="h-72 w-full rounded-2xl border border-slate-100"
                fitToMarkers={!filters.city}
              />
            </div>
          )}
          <FilterChips items={filterChips} onRemove={removeFilter} />
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

      {isMobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="mt-auto flex max-h-[90vh] w-full flex-col rounded-t-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-base font-semibold text-slate-900">{t('searchPage.filters.mobile.title')}</p>
                <p className="text-xs text-slate-500">{mobileFilterHelperText}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={t('common.actions.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filterPanelContent}</div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  clearAllFilters()
                  setIsMobileFiltersOpen(false)
                }}
              >
                {t('searchPage.filters.mobile.reset')}
              </Button>
              <Button type="button" className="flex-1" onClick={() => setIsMobileFiltersOpen(false)}>
                {t('searchPage.filters.mobile.apply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
