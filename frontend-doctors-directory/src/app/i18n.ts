import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ar } from '@/app/locales/ar'
import { en } from '@/app/locales/en'

i18n.use(initReactI18next).init({
  resources: { ar, en },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
