import { useTranslation } from 'react-i18next'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container flex flex-col gap-4 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-700">{t('footer.title')}</p>
          <p>{t('footer.description')}</p>
        </div>
        <div className="flex gap-4">
          <a href="mailto:care@doctors.directory" className="hover:text-primary-600">
            care@doctors.directory
          </a>
          <span dir="ltr" className="font-mono text-slate-700">
            +966 55 555 5555
          </span>
        </div>
      </div>
    </footer>
  )
}
