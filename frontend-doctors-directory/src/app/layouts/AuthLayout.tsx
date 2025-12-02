import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const AuthLayout = () => {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2" dir={dir}>
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-white lg:flex">
        <div>
          <Link to="/" className="text-2xl font-semibold text-white">
            {t('authLayout.tagline')}
          </Link>
          <p className="mt-4 max-w-md text-white/80">
            {t('authLayout.description')}
          </p>
        </div>
        <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
          <p className="text-lg font-semibold">{t('authLayout.cardTitle')}</p>
          <p className="text-sm text-white/80">{t('authLayout.cardDescription')}</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
