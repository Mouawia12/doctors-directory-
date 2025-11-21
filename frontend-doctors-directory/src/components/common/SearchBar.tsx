import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface SearchBarProps {
  onSearch: (filters: { q?: string; city?: string; specialty?: string }) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')

  const cities = [
    { value: '', label: t('searchBar.cities.all') },
    { value: t('searchBar.cities.riyadh'), label: t('searchBar.cities.riyadh') },
    { value: t('searchBar.cities.jeddah'), label: t('searchBar.cities.jeddah') },
    { value: t('searchBar.cities.dubai'), label: t('searchBar.cities.dubai') },
    { value: t('searchBar.cities.doha'), label: t('searchBar.cities.doha') },
    { value: t('searchBar.cities.cairo'), label: t('searchBar.cities.cairo') },
  ]

  const specialties = [
    { value: '', label: t('searchBar.specialties.all') },
    { value: t('searchBar.specialties.family'), label: t('searchBar.specialties.family') },
    { value: t('searchBar.specialties.cardio'), label: t('searchBar.specialties.cardio') },
    { value: t('searchBar.specialties.derm'), label: t('searchBar.specialties.derm') },
    { value: t('searchBar.specialties.pediatrics'), label: t('searchBar.specialties.pediatrics') },
    { value: t('searchBar.specialties.ophthalmology'), label: t('searchBar.specialties.ophthalmology') },
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
            placeholder={t('searchBar.placeholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
