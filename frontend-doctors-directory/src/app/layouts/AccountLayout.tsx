import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ClipboardSignature, ShieldCheck, Home, LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLogoutMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

const tabs = [
  { to: '/doctor', labelKey: 'accountLayout.tabs.overview', icon: UserRound },
  { to: '/doctor/profile', labelKey: 'accountLayout.tabs.profile', icon: ClipboardSignature },
  { to: '/doctor/pending', labelKey: 'accountLayout.tabs.review', icon: ShieldCheck },
]

export const AccountLayout = () => {
  const navigate = useNavigate()
  const logout = useLogoutMutation()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }) })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container flex flex-col items-center gap-4 py-6 text-center">
        <div className="text-center">
          <p className="text-xs text-slate-500">{t('accountLayout.portal')}</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t('accountLayout.heading')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('accountLayout.subheading')}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-2 overflow-x-auto text-sm md:flex-nowrap">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center rounded-2xl p-2 transition ${
                  isActive ? 'bg-primary-500/10 text-primary-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              <span className="sr-only">{t(tab.labelKey)}</span>
              <tab.icon className="h-4 w-4" />
            </NavLink>
          ))}
          <LanguageSwitcher variant="ghost" size="sm" />
          <Button variant="ghost" onClick={() => navigate('/')} title={t('accountLayout.goHome')}>
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logout.isPending}
            title={t('accountLayout.signOut')}
          >
            {logout.isPending ? t('accountLayout.signingOut') : <LogOut className="h-4 w-4" />}
          </Button>
          </div>
        </div>
      </div>
      <div className="container py-10">
        <Outlet />
      </div>
    </div>
  )
}
