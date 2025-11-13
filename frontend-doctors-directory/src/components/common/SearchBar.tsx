import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useLocaleText } from '@/app/hooks/useLocaleText'

interface SearchBarProps {
  onSearch: (filters: { q?: string; city?: string; specialty?: string }) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')
  const translate = useLocaleText()

  const cities = [
    { value: '', label: translate('كل المدن', 'All cities') },
    { value: 'الرياض', label: translate('الرياض', 'Riyadh') },
    { value: 'جدة', label: translate('جدة', 'Jeddah') },
    { value: 'دبي', label: translate('دبي', 'Dubai') },
    { value: 'الدوحة', label: translate('الدوحة', 'Doha') },
    { value: 'القاهرة', label: translate('القاهرة', 'Cairo') },
  ]

  const specialties = [
    { value: '', label: translate('كل التخصصات', 'All specialties') },
    { value: 'طب الأسرة', label: translate('طب الأسرة', 'Family Medicine') },
    { value: 'أمراض القلب', label: translate('أمراض القلب', 'Cardiology') },
    { value: 'الجلدية', label: translate('الجلدية', 'Dermatology') },
    { value: 'طب الأطفال', label: translate('طب الأطفال', 'Pediatrics') },
    { value: 'طب العيون', label: translate('طب العيون', 'Ophthalmology') },
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
          {translate('ابحث باسم الطبيب أو الخدمة', 'Search by doctor or service')}
        </label>
        <div className="relative">
          <Input
            placeholder={translate('مثال: قلب، تجميل...', 'Example: cardiology, cosmetic...')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">{translate('المدينة', 'City')}</label>
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
          {translate('التخصص', 'Specialty')}
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
          {translate('ابدأ البحث', 'Search')}
        </Button>
      </div>
    </form>
  )
}
