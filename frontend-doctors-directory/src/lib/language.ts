import type { TFunction } from 'i18next'

/**
 * Maps language codes to localized labels using translation keys.
 * Falls back to the uppercase code if a label is missing.
 */
export const languageLabel = (code: string, t: TFunction<'translation'>): string => {
  const key = `common.languageNames.${code}`
  const label = t(key, { defaultValue: '' })

  if (label && label !== key) {
    return label
  }

  return code.toUpperCase()
}
