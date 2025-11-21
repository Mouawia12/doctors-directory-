import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">{t('notFound.code')}</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {t('notFound.title')}
        </h1>
        <p className="text-slate-500">
          {t('notFound.description')}
        </p>
        <Button asChild>
          <Link to="/">{t('notFound.back')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
