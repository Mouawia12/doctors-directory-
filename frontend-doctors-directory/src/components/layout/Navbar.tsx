import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, LogOut, Menu, X, UserRound, Phone, Mail } from 'lucide-react'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { useSiteSettingsQuery } from '@/features/settings/hooks'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import clsx from 'clsx'
import { getDoctorPortalPath } from '@/features/doctor/utils'

export const Navbar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: user } = useAuthQuery()
  const { data: siteSettings } = useSiteSettingsQuery()
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

  const localizedSiteName =
    i18n.language === 'ar'
      ? siteSettings?.site_name ?? t('brand')
      : siteSettings?.site_name_en ?? siteSettings?.site_name ?? t('brand')
  const isRtl = i18n.dir() === 'rtl'
  const drawerPositionClass = isRtl ? 'left-0 rounded-e-[32px]' : 'right-0 rounded-s-[32px]'
  const contactPhone = siteSettings?.support_phone ?? '+966 55 555 5555'
  const contactEmail = siteSettings?.support_email ?? 'care@doctors.directory'

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-primary-600">
          {siteSettings?.site_logo_url ? (
            <img
              src={siteSettings.site_logo_url}
              alt={localizedSiteName}
              className="h-10 w-auto rounded-2xl border border-slate-200 bg-white p-1 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              {t('nav.brandShort')}
            </span>
          )}
          <span className="text-slate-900">{localizedSiteName}</span>
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
                <Button variant="outline" className="px-3 py-1.5 text-sm" asChild>
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
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={clsx(
              'fixed top-0 bottom-0 flex w-[85%] max-w-xs flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300',
              drawerPositionClass,
              isRtl ? 'translate-x-0' : 'translate-x-0',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{t('nav.menu')}</p>
                <p className="text-sm font-semibold text-slate-900">{localizedSiteName}</p>
              </div>
              <button
                type="button"
                aria-label={t('common.actions.close')}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {user && (
              <div className="mx-6 mt-4 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">{t('nav.hello')}</p>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              </div>
            )}
            <nav className="mt-4 flex-1 overflow-y-auto px-6 pb-4">
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('nav.quickLinks')}
                </p>
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
                      >
                        <span>{link.label}</span>
                        <span aria-hidden="true">›</span>
                      </NavLink>
                    </li>
                  ))}
                  {isDoctor && (
                    <>
                      <li>
                        <NavLink
                          to={doctorPortalPath}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
                        >
                          <span>{t('nav.doctorPortal')}</span>
                          <span aria-hidden="true">›</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/doctor"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
                        >
                          <span>{t('nav.myProfile')}</span>
                          <span aria-hidden="true">›</span>
                        </NavLink>
                      </li>
                    </>
                  )}
                  {isPatient && (
                    <li>
                      <NavLink
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
                      >
                        <span>{t('nav.userDashboard')}</span>
                        <span aria-hidden="true">›</span>
                      </NavLink>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <NavLink
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
                      >
                        <span>{t('nav.admin')}</span>
                        <span aria-hidden="true">›</span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>
            </nav>
            <div className="space-y-4 border-t border-slate-100 p-6">
              <div className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-wide text-slate-400">{t('nav.contact', { defaultValue: 'تواصل معنا' })}</p>
                <a href={`tel:${contactPhone}`} className="mt-2 flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-primary-500" />
                  {contactPhone}
                </a>
                <a href={`mailto:${contactEmail}`} className="mt-1 flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-primary-500" />
                  {contactEmail}
                </a>
              </div>
              {!user ? (
                <>
                  <Button asChild>
                    <Link to="/auth/login">{t('nav.login')}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/auth/register">{t('nav.join')}</Link>
                  </Button>
                  <LanguageSwitcher fullWidth variant="outline" size="sm" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <LanguageSwitcher variant="outline" size="sm" className="flex-1" fullWidth />
                  <Button
                    variant="ghost"
                    className="h-11 w-11 rounded-2xl p-0"
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
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
