import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ClipboardSignature, ShieldCheck, Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLogoutMutation } from '@/features/auth/hooks'

const tabs = [
  { to: '/doctor/profile', label: 'ملفي المهني', icon: ClipboardSignature },
  { to: '/doctor/pending', label: 'حالة المراجعة', icon: ShieldCheck },
]

export const AccountLayout = () => {
  const navigate = useNavigate()
  const logout = useLogoutMutation()

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }) })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container flex flex-col items-center gap-4 py-6 text-center">
        <div className="text-center">
          <p className="text-xs text-slate-500">بوابة الأطباء</p>
          <h1 className="text-2xl font-semibold text-slate-900">إدارة الملف والعيادات</h1>
          <p className="text-sm text-slate-500">تحكم بملفك وتأكد من تحديث بياناتك المعتمدة.</p>
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
              <span className="sr-only">{tab.label}</span>
              <tab.icon className="h-4 w-4" />
            </NavLink>
          ))}
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? '...' : <LogOut className="h-4 w-4" />}
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
