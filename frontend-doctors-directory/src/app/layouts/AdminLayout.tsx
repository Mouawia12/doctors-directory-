import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Search,
  Stethoscope,
  UserRound,
  Home,
  Users,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'
import { Input } from '@/components/ui/Input'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner'
import { useSiteSettingsQuery } from '@/features/settings/hooks'

type NavItem = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  to?: string
  end?: boolean
  children?: Array<{ id: string; label: string; to: string }>
}

export const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const { data: user } = useAuthQuery()
  const { data: siteSettings } = useSiteSettingsQuery()
  const logoutMutation = useLogoutMutation()
  const navSections: NavItem[] = useMemo(
    () => [
      { id: 'dashboard', label: t('adminLayout.nav.home'), icon: LayoutDashboard, to: '/admin', end: true },
      {
        id: 'doctors',
        label: t('adminLayout.nav.doctors'),
        icon: Stethoscope,
        children: [
          { id: 'doctors-list', label: t('adminLayout.nav.doctorsList'), to: '/admin/doctors' },
          { id: 'doctors-create', label: t('adminLayout.nav.doctorsCreate'), to: '/admin/doctors/new' },
        ],
      },
      { id: 'admins', label: t('adminLayout.nav.admins'), icon: ShieldCheck, to: '/admin/admins' },
      { id: 'users', label: t('adminLayout.nav.users'), icon: Users, to: '/admin/users' },
      { id: 'categories', label: t('adminLayout.nav.categories'), icon: Layers, to: '/admin/categories' },
      { id: 'newsletter', label: t('adminLayout.nav.newsletter'), icon: Mail, to: '/admin/newsletter' },
      { id: 'settings', label: t('adminLayout.nav.settings'), icon: SlidersHorizontal, to: '/admin/settings' },
      { id: 'security', label: t('adminLayout.nav.security'), icon: UserRound, to: '/admin/password' },
    ],
    [t, i18n.language],
  )

  const headerActions = useMemo(
    () => [{ id: 'home', icon: Home, label: t('adminLayout.nav.home'), to: '/admin' }],
    [t, i18n.language],
  )

  const initialGroups = useMemo(
    () =>
      navSections
        .filter((section) => section.children)
        .reduce<Record<string, boolean>>((acc, section) => {
          acc[section.id] = section.children?.some((child) => location.pathname.startsWith(child.to)) ?? false
          return acc
        }, {}),
    [location.pathname, navSections],
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialGroups)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const currentDir = i18n.dir()
  const isRTL = currentDir === 'rtl'
  const brandName =
    i18n.language === 'ar'
      ? siteSettings?.site_name ?? t('brand')
      : siteSettings?.site_name_en ?? siteSettings?.site_name ?? t('brand')
  const brandInitial = brandName.slice(0, 1).toUpperCase()

  useEffect(() => {
    if (location.pathname.startsWith('/admin/doctors')) {
      const params = new URLSearchParams(location.search)
      setSearchTerm(params.get('q') ?? '')
    } else {
      setSearchTerm('')
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      navSections.forEach((section) => {
        if (section.children) {
          next[section.id] = section.children.some((child) => location.pathname.startsWith(child.to))
        }
      })
      return next
    })
    setSidebarOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  useEffect(() => {
    const closeMenus = () => setUserMenuOpen(false)
    i18n.on('languageChanged', closeMenus)
    return () => {
      i18n.off('languageChanged', closeMenus)
    }
  }, [i18n])

  const sidebarContent = (closeSidebar?: () => void) => (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary-700 to-indigo-700 p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          {siteSettings?.site_logo_url ? (
            <img
              src={siteSettings.site_logo_url}
              alt={brandName}
              className="h-12 w-12 rounded-2xl border border-white/20 bg-white/10 p-1 object-contain"
            />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold text-white">
              {brandInitial}
            </span>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-primary-100/70">{t('adminLayout.dashboard')}</p>
            <h2 className="text-lg font-semibold text-white">{brandName}</h2>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t('adminLayout.mainMenu')}
        </p>
        <nav className="mt-2 space-y-2">
          {navSections.map((section) =>
            section.children ? (
              <div key={section.id} className="rounded-2xl border border-transparent">
                <button
                  type="button"
                  onClick={() => toggleGroup(section.id)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium',
                    openGroups[section.id] ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 transition-transform',
                      openGroups[section.id] ? 'rotate-180 text-primary-500' : 'text-slate-400',
                    )}
                  />
                </button>
                {openGroups[section.id] && (
                  <div className="mt-1 space-y-1 rounded-2xl bg-white p-2 shadow-sm">
                    {section.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.to}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                            isActive
                              ? 'bg-primary-50 font-semibold text-primary-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700',
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={section.id}
                to={section.to as string}
                end={section.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </NavLink>
            ),
          )}
        </nav>
      </div>
    </div>
  )

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    const params = trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''
    navigate(`/admin/doctors${params}`)
  }

  const headerSearch = (
    <form className="relative w-full max-w-xs" onSubmit={handleSearchSubmit}>
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder={t('adminLayout.searchPlaceholder')}
        className={clsx(
          'h-11 rounded-2xl border-transparent bg-slate-100 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-400',
          isRTL ? 'pr-10 text-right' : 'pl-10 text-left',
        )}
      />
      <Search
        className={clsx(
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
          isRTL ? 'right-3' : 'left-3',
        )}
      />
    </form>
  )

  return (
    <div className="flex min-h-screen bg-slate-100" dir={currentDir}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div className={clsx('w-72 bg-white px-4 py-6 shadow-2xl', isRTL ? 'ml-auto' : 'mr-auto')}>
            {sidebarContent(() => setSidebarOpen(false))}
          </div>
          <div className="flex-1 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <aside
        className={clsx(
          'hidden w-72 flex-col bg-white px-4 py-6 shadow-lg lg:flex',
          isRTL ? 'border-l border-slate-200' : 'border-r border-slate-200',
        )}
      >
        {sidebarContent()}
      </aside>

      <div className="flex flex-1 flex-col">
        <EmailVerificationBanner />
        <header className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label={t('adminLayout.openMenu')}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs text-slate-500">{t('adminLayout.overview')}</p>
                  <h1 className="text-2xl font-semibold text-slate-900">{t('adminLayout.welcome')}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block">{headerSearch}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow">
                    <LanguageSwitcher size="sm" variant="ghost" />
                    {headerActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          if (action.to) navigate(action.to)
                        }}
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-primary-600"
                        title={action.label}
                      >
                        <action.icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-primary-600 shadow-sm"
              aria-label={t('adminLayout.userMenu')}
                    >
                      {user?.name ? (
                        <span className="text-sm font-semibold">{user.name.slice(0, 1)}</span>
                      ) : (
                        <UserRound className="h-5 w-5" />
                      )}
                    </button>
                    <ChevronDown
                      className={clsx(
                        'pointer-events-none absolute -bottom-2 text-slate-400',
                        isRTL ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2',
                      )}
                    />
                    {userMenuOpen && (
                      <div
                        className={clsx(
                          'absolute z-40 mt-4 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-2xl',
                          isRTL ? 'left-0' : 'right-0',
                        )}
                      >
                        <div className="rounded-2xl bg-slate-50 p-3 text-right text-xs text-slate-500">
                          <p>
                            {t('adminLayout.email')}: {user?.email ?? 'admin@doctors.local'}
                          </p>
                          <p className="mt-1">
                            {t('adminLayout.roles')}: {(user?.roles || ['admin']).join(t('common.comma'))}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-3 flex w-full items-center justify-between rounded-2xl px-3 py-2 text-slate-600 hover:bg-slate-100"
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                        >
                          <span>
                            {logoutMutation.isPending
                              ? t('adminLayout.loggingOut')
                              : t('adminLayout.logout')}
                          </span>
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden">{headerSearch}</div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
