import { useLocaleText } from '@/app/hooks/useLocaleText'

export const Footer = () => {
  const translate = useLocaleText()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container flex flex-col gap-4 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-700">{translate('دليل الأطباء', 'Doctors Directory')}</p>
          <p>{translate('منصة موحدة للعثور على أفضل الأطباء في منطقتك.', 'A unified platform to find the best doctors in your area.')}</p>
        </div>
        <div className="flex gap-4">
          <a href="mailto:care@doctors.directory" className="hover:text-primary-600">
            care@doctors.directory
          </a>
          <span>+966 55 555 5555</span>
        </div>
      </div>
    </footer>
  )
}
