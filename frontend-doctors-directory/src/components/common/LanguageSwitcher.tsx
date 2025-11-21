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
      <span className="text-xs font-semibold uppercase tracking-wide">
        {isArabic ? 'AR' : 'EN'}
      </span>
      {showLabel && <span className="text-xs text-slate-500">{t('language.label')}</span>}
    </Button>
  )
}

export default LanguageSwitcher
