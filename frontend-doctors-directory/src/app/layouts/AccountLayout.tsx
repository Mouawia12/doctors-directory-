import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/doctor/profile', label: 'ملفي المهني' },
  { to: '/doctor/pending', label: 'حالة المراجعة' },
]

export const AccountLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="border-b border-slate-200 bg-white">
      <div className="container flex flex-col items-center gap-4 py-6 text-center">
        <div>
          <p className="text-xs text-slate-500">بوابة الأطباء</p>
          <h1 className="text-2xl font-semibold text-slate-900">إدارة الملف والعيادات</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
    <div className="container py-10">
      <Outlet />
    </div>
  </div>
)
