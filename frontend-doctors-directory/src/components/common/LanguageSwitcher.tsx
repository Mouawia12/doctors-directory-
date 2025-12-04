import { Languages } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

type LanguageSwitcherProps = {
  variant?: 'ghost' | 'outline'
  size?: 'sm' | 'md'
  showLabel?: boolean
  fullWidth?: boolean
  className?: string
}

export const LanguageSwitcher = ({
  variant = 'ghost',
  size = 'md',
  showLabel = false,
  fullWidth = false,
  className,
}: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const next = isArabic ? 'en' : 'ar'
  const currentLabel = isArabic ? t('language.arabic') : t('language.english')
  const nextLabel = isArabic ? t('language.english') : t('language.arabic')

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => i18n.changeLanguage(next)}
      className={clsx(
        'gap-2 rounded-full',
        size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm',
        fullWidth && 'w-full justify-center',
        className,
      )}
      aria-label={t('language.label')}
      title={t('language.label')}
    >
      <Languages className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      <div className="flex flex-col leading-tight text-xs">
        <span className="font-semibold text-slate-900">{currentLabel}</span>
        <span className="text-[10px] text-slate-500">{t('language.label')}</span>
      </div>
      {showLabel && <span className="text-[11px] text-slate-500">{nextLabel}</span>}
    </Button>
  )
}

export default LanguageSwitcher
