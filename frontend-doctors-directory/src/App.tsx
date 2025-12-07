import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from '@/app/router'
import { useSiteSettingsQuery } from '@/features/settings/hooks'

const FaviconManager = () => {
  const { data } = useSiteSettingsQuery()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const faviconUrl = data?.site_logo_url ?? '/vite.svg'
    const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']") ?? document.createElement('link')
    existingLink.type = 'image/png'
    existingLink.rel = 'icon'
    existingLink.href = faviconUrl

    if (!existingLink.parentNode) {
      document.head.appendChild(existingLink)
    }
  }, [data?.site_logo_url])

  return null
}

const App = () => {
  return (
    <>
      <FaviconManager />
      <RouterProvider router={router} />
    </>
  )
}

export default App
