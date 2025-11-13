import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useLocaleText } from '@/app/hooks/useLocaleText'

export const NotFoundPage = () => {
  const translate = useLocaleText()

  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">{translate('خطأ 404', 'Error 404')}</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {translate('الصفحة غير موجودة', 'Page not found')}
        </h1>
        <p className="text-slate-500">
          {translate('ربما تم نقل الصفحة أو لم تعد متاحة.', 'The page may have been moved or is no longer available.')}
        </p>
        <Button asChild>
          <Link to="/">{translate('العودة للصفحة الرئيسية', 'Back to homepage')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
