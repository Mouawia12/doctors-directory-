import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  Languages,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Stethoscope,
  UserRound,
  Home,
} from 'lucide-react'
import clsx from 'clsx'
import { Input } from '@/components/ui/Input'
import { useAuthQuery, useLogoutMutation } from '@/features/auth/hooks'
import { useTranslation } from 'react-i18next'
import { useLocaleText } from '@/app/hooks/useLocaleText'

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
  const { i18n } = useTranslation()
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()
  const translate = useLocaleText()
  const navSections: NavItem[] = useMemo(
    () => [
      { id: 'dashboard', label: translate('الرئيسية', 'Home'), icon: LayoutDashboard, to: '/admin', end: true },
      {
        id: 'doctors',
        label: translate('إدارة الأطباء', 'Doctors'),
        icon: Stethoscope,
        children: [
          { id: 'doctors-list', label: translate('قائمة الأطباء', 'Doctors list'), to: '/admin/doctors' },
          { id: 'doctors-create', label: translate('إضافة طبيب', 'Add doctor'), to: '/admin/doctors/new' },
        ],
      },
      { id: 'categories', label: translate('التصنيفات الطبية', 'Categories'), icon: Layers, to: '/admin/categories' },
    ],
    [translate, i18n.language],
  )

  const headerActions = useMemo(
    () => [
      { id: 'home', icon: Home, label: translate('الرئيسية', 'Home'), to: '/admin' },
      { id: 'chat', icon: MessageSquare, label: translate('الدردشة', 'Chat') },
      { id: 'mail', icon: Mail, label: translate('البريد', 'Inbox') },
      { id: 'notifications', icon: Bell, label: translate('التنبيهات', 'Notifications'), badge: true },
    ],
    [translate, i18n.language],
  )

  const languageOptions = useMemo(
    () => [
      { code: 'ar', label: translate('العربية', 'Arabic') },
      { code: 'en', label: translate('الإنجليزية', 'English') },
    ],
    [translate, i18n.language],
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
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const currentDir = i18n.dir()
  const isRTL = currentDir === 'rtl'

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
    const closeMenus = () => {
      setLanguageMenuOpen(false)
      setUserMenuOpen(false)
    }
    i18n.on('languageChanged', closeMenus)
    return () => {
      i18n.off('languageChanged', closeMenus)
    }
  }, [i18n])

  const sidebarContent = (closeSidebar?: () => void) => (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary-700 to-indigo-700 p-4 text-white shadow-lg">
        <h2 className="text-xl font-semibold">{translate('لوحة الإدارة', 'Admin Console')}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {translate('القائمة الرئيسية', 'Main menu')}
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

  const headerSearch = (
    <div className="relative w-full max-w-xs">
      <Input
        placeholder={translate('ابحث في لوحة التحكم', 'Search in dashboard')}
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
    </div>
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
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label={translate('فتح القائمة', 'Open menu')}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs text-slate-500">{translate('نظرة عامة', 'Overview')}</p>
                  <h1 className="text-2xl font-semibold text-slate-900">{translate('مرحباً بعودتك', 'Welcome back')}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block">{headerSearch}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setLanguageMenuOpen((prev) => !prev)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-primary-600"
                        title={translate('تغيير اللغة', 'Change language')}
                      >
                        <Languages className="h-5 w-5" />
                      </button>
                      {languageMenuOpen && (
                        <div
                          className={clsx(
                            'absolute z-20 mt-2 w-32 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-xl',
                            isRTL ? 'right-0' : 'left-0',
                          )}
                        >
                          {languageOptions.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                i18n.changeLanguage(lang.code)
                                setLanguageMenuOpen(false)
                              }}
                              className={clsx(
                                'flex w-full items-center justify-between rounded-xl px-3 py-1 text-xs',
                                i18n.language === lang.code
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-slate-600 hover:bg-slate-100',
                              )}
                            >
                              <span>{lang.label}</span>
                              {i18n.language === lang.code && (
                                <span className="text-primary-600">●</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                        {action.badge && (
                          <span
                            className={clsx(
                              'absolute top-2 inline-flex h-2 w-2 rounded-full bg-rose-500',
                              isRTL ? 'left-2' : 'right-2',
                            )}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-primary-600 shadow-sm"
                      aria-label={translate('حساب المستخدم', 'User menu')}
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
                          'absolute z-20 mt-4 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-xl',
                          isRTL
                            ? 'right-1/2 translate-x-1/2'
                            : 'left-1/2 -translate-x-1/2',
                        )}
                      >
                        <div className="rounded-2xl bg-slate-50 p-3 text-right text-xs text-slate-500">
                          <p>
                            {translate('البريد', 'Email')}: {user?.email ?? 'admin@doctors.local'}
                          </p>
                          <p className="mt-1">
                            {translate('الأدوار', 'Roles')}:{' '}
                            {(user?.roles || ['admin']).join(translate('، ', ', '))}
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
                              ? translate('جاري تسجيل الخروج...', 'Signing out...')
                              : translate('تسجيل الخروج', 'Logout')}
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
