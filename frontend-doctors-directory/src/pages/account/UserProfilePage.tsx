import { useTranslation } from 'react-i18next'
import { useAuthQuery } from '@/features/auth/hooks'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

const buildAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D7DF5&color=fff`

export const UserProfilePage = () => {
  const { data: user } = useAuthQuery()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dir = i18n.dir()

  if (!user) {
    return null
  }

  const avatar = user.avatar_url || buildAvatar(user.name)
  const roleLabel = user.roles.includes('doctor') ? t('account.profile.roles.doctor') : t('account.profile.roles.user')

  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      <Navbar />
      <main className="flex-1">
        <div className="container space-y-8 py-8">
          <div className="flex justify-start">
            <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => navigate(-1)}>
              {t('common.actions.back')}
            </Button>
          </div>
          <section className="grid gap-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-card md:grid-cols-[240px,1fr]">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={avatar} alt={user.name} className="h-40 w-40 rounded-[32px] object-cover" loading="lazy" />
          <h1 className="text-2xl font-semibold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {roleLabel}
          </span>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('account.profile.title')}</h2>
          <p className="text-sm text-slate-500">{t('account.profile.description')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t('account.profile.fields.name')}</p>
              <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t('account.profile.fields.email')}</p>
              <p className="text-lg font-semibold text-slate-900">{user.email}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('account.password.title')}</h2>
        <p className="text-sm text-slate-500">{t('account.password.description')}</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default UserProfilePage
