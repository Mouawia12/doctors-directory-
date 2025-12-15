import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { therapySpecialties } from '@/data/therapySpecialties'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (filters: { q?: string; city?: string; specialty?: string }) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { t, i18n } = useTranslation()
  const direction = i18n.dir()
  const isRTL = direction === 'rtl'
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')

  const cities = [
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

  const specialties = [
    { value: '', label: t('searchBar.specialties.all') },
    ...therapySpecialties.map((item) => ({
      value: item.ar,
      label: i18n.language.startsWith('ar') ? item.ar : item.en,
    })),
  ]

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch({ q, city, specialty })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 p-4 md:grid-cols-4"
    >
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t('searchBar.label')}
        </label>
        <div className="relative">
          <Input
            className={cn('h-11', isRTL ? 'pr-10' : 'pl-10')}
            placeholder={t('searchBar.placeholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
              isRTL ? 'right-3' : 'left-3',
            )}
            aria-hidden="true"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">{t('searchBar.city')}</label>
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((cityOption) => (
            <option key={cityOption.value} value={cityOption.value}>
              {cityOption.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t('searchBar.specialty')}
        </label>
        <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          {specialties.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:col-span-4 flex items-center justify-end">
        <Button type="submit" className="w-full md:w-auto">
          {t('searchBar.submit')}
        </Button>
      </div>
    </form>
  )
}
