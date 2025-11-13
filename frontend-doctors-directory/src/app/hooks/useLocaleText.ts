import { useTranslation } from 'react-i18next'

export const useLocaleText = () => {
  const { i18n } = useTranslation()

  return (arText: string, enText: string) => (i18n.language === 'ar' ? arText : enText)
}
