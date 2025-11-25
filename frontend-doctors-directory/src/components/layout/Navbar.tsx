import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, LogOut, Menu, X, UserRound } from 'lucide-react'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import clsx from 'clsx'
import { getDoctorPortalPath } from '@/features/doctor/utils'

export const Navbar = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()

  const navLinks = useMemo(
    () => [
      { to: '/', label: t('nav.home') },
      { to: '/search', label: t('nav.search') },
      { to: '/favorites', label: t('nav.favorites') },
    ],
    [t],
  )

  const isDoctor = user?.roles.includes('doctor')
  const isAdmin = user?.roles.includes('admin')
  const isPatient = user?.roles.includes('user') && !isDoctor
  const doctorPortalPath = getDoctorPortalPath()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            {t('nav.brandShort')}
          </span>
          {t('brand')}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'text-slate-600 transition hover:text-primary-600',
                  (isActive || location.pathname === link.to) && 'text-primary-600 font-medium',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isDoctor && (
            <NavLink to={doctorPortalPath} className="text-slate-600 hover:text-primary-600">
              {t('nav.doctorPortal')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="text-slate-600 hover:text-primary-600">
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {t('nav.hello')} {user.name}
              </span>
              <LanguageSwitcher variant="outline" size="sm" />
              {isPatient && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/account">{t('nav.userDashboard')}</Link>
                </Button>
              )}
              {isDoctor && (
                <Button variant="ghost" className="h-10 w-10 rounded-2xl p-0" asChild aria-label={t('nav.myProfile')} title={t('nav.myProfile')}>
                  <Link to="/doctor">
                    <UserRound className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-2xl p-0"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">{t('nav.join')}</Link>
              </Button>
              <LanguageSwitcher variant="outline" size="sm" />
            </>
          )}
        </div>
        <button
          aria-label={t('nav.menu')}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
          <div className="container flex flex-col gap-4 py-4 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-slate-700"
              >
                {link.label}
              </NavLink>
            ))}
            {isDoctor && (
              <>
                <NavLink to={doctorPortalPath} onClick={() => setMenuOpen(false)}>
                  {t('nav.doctorPortal')}
                </NavLink>
                <NavLink to="/doctor" onClick={() => setMenuOpen(false)}>
                  {t('nav.myProfile')}
                </NavLink>
              </>
            )}
            {isPatient && (
              <NavLink to="/account" onClick={() => setMenuOpen(false)}>
                {t('nav.userDashboard')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                {t('nav.admin')}
              </NavLink>
            )}
            {!user ? (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/auth/login">{t('nav.login')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth/register">{t('nav.join')}</Link>
                </Button>
                <LanguageSwitcher fullWidth variant="outline" size="sm" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="text-slate-600">
                  {t('nav.hello')} {user.name}
                </span>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher variant="outline" size="sm" className="flex-1" fullWidth />
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-2xl p-0"
                    onClick={() => {
                      setMenuOpen(false)
                      logoutMutation.mutate()
                    }}
                    disabled={logoutMutation.isPending}
                    aria-label={t('nav.logout')}
                    title={t('nav.logout')}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
