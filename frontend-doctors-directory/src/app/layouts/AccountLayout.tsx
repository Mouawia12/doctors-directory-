import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ClipboardSignature, ShieldCheck, Home, LogOut, UserRound, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLogoutMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner'

const tabs = [
  { to: '/doctor', labelKey: 'accountLayout.tabs.overview', icon: UserRound },
  { to: '/doctor/profile', labelKey: 'accountLayout.tabs.profile', icon: ClipboardSignature },
  { to: '/doctor/pending', labelKey: 'accountLayout.tabs.review', icon: ShieldCheck },
]

export const AccountLayout = () => {
  const navigate = useNavigate()
  const logout = useLogoutMutation()
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }) })
  }

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
