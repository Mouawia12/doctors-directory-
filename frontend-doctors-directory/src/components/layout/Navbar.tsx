import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import clsx from 'clsx'
import { useLocaleText } from '@/app/hooks/useLocaleText'

export const Navbar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()
  const translate = useLocaleText()

  const navLinks = [
    { to: '/', label: translate('الرئيسية', 'Home') },
    { to: '/search', label: translate('ابحث', 'Search') },
    { to: '/favorites', label: translate('مفضلتي', 'Favorites') },
  ]

  const isDoctor = user?.roles.includes('doctor')
  const isAdmin = user?.roles.includes('admin')

  const languageOptions = [
    { value: 'ar', label: translate('العربية', 'Arabic') },
    { value: 'en', label: translate('الإنجليزية', 'English') },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            {translate('د', 'D')}
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
            <NavLink
              to={
                user?.doctor_profile?.status === 'approved'
                  ? '/doctor/profile'
                  : '/doctor/pending'
              }
              className="text-slate-600 hover:text-primary-600"
            >
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
          <div className="relative w-36">
            <Select
              value={i18n.language}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              className="w-full appearance-none rounded-2xl border-slate-200 py-2 pr-10 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 focus:border-primary-400"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {translate('مرحباً', 'Hello')} {user.name}
              </span>
              <Button variant="outline" asChild>
                <Link to="/favorites">{translate('مفضلتي', 'Favorites')}</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending
                  ? translate('يتم تسجيل الخروج...', 'Signing out...')
                  : translate('تسجيل الخروج', 'Logout')}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">{translate('دخول', 'Login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">{translate('انضم الآن', 'Join now')}</Link>
              </Button>
            </>
          )}
        </div>
        <button
          aria-label="قائمة"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
          <div className="container flex flex-col gap-4 py-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {translate('اختر اللغة', 'Select language')}
              </label>
              <div className="relative">
                <Select
                  value={i18n.language}
                  onChange={(event) => i18n.changeLanguage(event.target.value)}
                  className="w-full appearance-none rounded-2xl border-slate-200 py-2 pr-10 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
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
              <NavLink
                to={user?.doctor_profile?.status === 'approved' ? '/doctor/profile' : '/doctor/pending'}
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.doctorPortal')}
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
                  <Link to="/auth/login">{translate('دخول', 'Login')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth/register">{translate('انضم الآن', 'Join now')}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-slate-600">
                  {translate('مرحباً', 'Hello')} {user.name}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuOpen(false)
                    logoutMutation.mutate()
                  }}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending
                    ? translate('جاري الخروج...', 'Signing out...')
                    : translate('تسجيل الخروج', 'Logout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
