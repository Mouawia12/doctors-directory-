import { type ReactNode, Suspense, useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import i18n from '@/app/i18n'
import { queryClient } from '@/lib/queryClient'
import { useDirection } from '@/app/hooks/useDirection'
import { env } from '@/lib/env'

const LANGUAGE_STORAGE_KEY = 'dd_locale'

type Props = {
  children: ReactNode
}

export const AppProviders = ({ children }: Props) => {
  useDirection()
  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored && stored !== i18n.language) {
        i18n.changeLanguage(stored)
      }
    }
  }, [])

  useEffect(() => {
    const handler = (lng: string) => {
      setLanguage(lng)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
      }
    }
    i18n.on('languageChanged', handler)
    return () => {
      i18n.off('languageChanged', handler)
    }
  }, [])

  const content = (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-lg text-slate-600">
          {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
        </div>
      }
    >
      {children}
    </Suspense>
  )

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {env.googleClientId ? <GoogleOAuthProvider clientId={env.googleClientId}>{content}</GoogleOAuthProvider> : content}
        <Toaster position="top-center" dir={i18n.dir(language)} closeButton richColors />
      </QueryClientProvider>
    </I18nextProvider>
  )
}
