export const formatSpecialtyList = (
  value: string[] | string | null | undefined,
  separator: string,
) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(separator)
  }

  return value ?? ''
}
