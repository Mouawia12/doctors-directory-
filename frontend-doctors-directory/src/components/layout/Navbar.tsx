import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, LogOut, Menu, X, UserRound } from 'lucide-react'
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
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
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

  const isDoctor = Boolean(user?.roles.includes('doctor'))
  const isAdmin = Boolean(user?.roles.includes('admin'))
  const isPatient = Boolean(user?.roles.includes('user') && !isDoctor)
  const doctorPortalPath = getDoctorPortalPath()
  const drawerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (menuOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setMenuOpen(false)
      }

      document.addEventListener('keydown', handleKeyDown)
      const focusTarget = drawerRef.current?.querySelector<HTMLElement>('[data-focus-start]')
      focusTarget?.focus()

      return () => {
        document.body.style.overflow = previousOverflow
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [menuOpen])

  const localizedSiteName =
    i18n.language === 'ar'
      ? siteSettings?.site_name ?? t('brand')
      : siteSettings?.site_name_en ?? siteSettings?.site_name ?? t('brand')

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
          onClick={() => setMenuOpen((prev) => !prev)}
          ref={toggleButtonRef}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAfterClose={() => toggleButtonRef.current?.focus()}
        drawerRef={drawerRef}
        navLinks={navLinks}
        isDoctor={isDoctor}
        isAdmin={isAdmin}
        isPatient={isPatient}
        user={user}
        t={t}
        doctorPortalPath={doctorPortalPath}
        logoutMutation={logoutMutation}
      />
    </header>
  )
}

type NavLinkItem = { to: string; label: string }

type MobileNavDrawerProps = {
  open: boolean
  onClose: () => void
  onAfterClose?: () => void
  drawerRef: React.RefObject<HTMLDivElement | null>
  navLinks: NavLinkItem[]
  isDoctor: boolean
  isAdmin: boolean
  isPatient: boolean
  user: ReturnType<typeof useAuthQuery>['data']
  t: ReturnType<typeof useTranslation>['t']
  doctorPortalPath: string
  logoutMutation: ReturnType<typeof useLogoutMutation>
}

const MobileNavDrawer = ({
  open,
  onClose,
  onAfterClose,
  drawerRef,
  navLinks,
  isDoctor,
  isAdmin,
  isPatient,
  user,
  t,
  doctorPortalPath,
  logoutMutation,
}: MobileNavDrawerProps) => {
  const [visible, setVisible] = useState(open)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setVisible(true)
    } else {
      closeTimerRef.current = setTimeout(() => {
        setVisible(false)
        onAfterClose?.()
      }, 300)
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [open, onAfterClose])

  if (!visible) return null

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <div
      className={clsx(
        'md:hidden fixed inset-0 z-50 transition duration-300',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        className={clsx(
          'absolute inset-0 bg-white transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'absolute inset-y-0 right-0 h-screen w-full max-w-full transform bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto overscroll-contain',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        onClick={stopPropagation}
      >
        <div className="flex min-h-full flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">{t('nav.menu')}</span>
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 text-slate-600"
              onClick={onClose}
            aria-label={t('common.close')}
            data-focus-start
          >
            <X className="h-5 w-5" />
          </button>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={onClose} className="text-slate-700">
                {link.label}
              </NavLink>
            ))}

            {isDoctor && (
              <>
                <NavLink to={doctorPortalPath} onClick={onClose} className="text-slate-700">
                  {t('nav.doctorPortal')}
                </NavLink>
                <NavLink to="/doctor" onClick={onClose} className="text-slate-700">
                  {t('nav.myProfile')}
                </NavLink>
              </>
            )}
            {isPatient && (
              <NavLink to="/account" onClick={onClose} className="text-slate-700">
                {t('nav.userDashboard')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={onClose} className="text-slate-700">
                {t('nav.admin')}
              </NavLink>
            )}

            {!user ? (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/auth/login" onClick={onClose}>
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth/register" onClick={onClose}>
                    {t('nav.join')}
                  </Link>
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
                      onClose()
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
      </div>
    </div>
  )
}
