import { useEffect } from 'react'
import i18n from '@/app/i18n'

export const useDirection = () => {
  useEffect(() => {
    const handleDirection = (lng: string) => {
      const dir = i18n.dir(lng)
      document.documentElement.dir = dir
      document.documentElement.lang = lng
    }

    handleDirection(i18n.language)
    i18n.on('languageChanged', handleDirection)

    return () => {
      i18n.off('languageChanged', handleDirection)
    }
  }, [])
}
