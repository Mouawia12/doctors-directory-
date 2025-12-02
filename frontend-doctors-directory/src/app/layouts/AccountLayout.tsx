import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner'

export const AccountLayout = () => {
  const { i18n } = useTranslation()
  const dir = i18n.dir()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" dir={dir}>
      <EmailVerificationBanner />
      <Navbar />
      <main className="flex-1">
        <div className="container py-10">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
