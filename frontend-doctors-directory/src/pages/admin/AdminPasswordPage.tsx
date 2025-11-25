import { useTranslation } from 'react-i18next'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'

const AdminPasswordPage = () => {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  return (
    <div className="space-y-6" dir={dir}>
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">{t('account.password.adminTitle')}</h1>
        <p className="text-sm text-slate-500">{t('account.password.adminDescription')}</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  )
}

export default AdminPasswordPage
