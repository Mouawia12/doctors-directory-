import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAdminSiteSettingsQuery, useUpdateAdminSiteSettings } from '@/features/settings/hooks'
import { toast } from 'sonner'

interface SettingsFormState {
  site_name: string
  site_name_en: string
  support_email: string
  support_phone: string
}

export const AdminSettingsPage = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminSiteSettingsQuery()
  const mutation = useUpdateAdminSiteSettings()
  const [formState, setFormState] = useState<SettingsFormState>({
    site_name: '',
    site_name_en: '',
    support_email: '',
    support_phone: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setFormState({
        site_name: data.site_name ?? '',
        site_name_en: data.site_name_en ?? '',
        support_email: data.support_email ?? '',
        support_phone: data.support_phone ?? '',
      })
      setLogoPreview(data.site_logo_url ?? null)
    }
  }, [data])

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview)
      }
    }
  }, [logoPreview])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    setLogoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('site_name', formState.site_name)
    formData.append('site_name_en', formState.site_name_en)
    formData.append('support_email', formState.support_email)
    formData.append('support_phone', formState.support_phone)
    if (logoFile) {
      formData.append('logo', logoFile)
    }

    mutation.mutate(formData, {
      onSuccess: () => toast.success(t('adminSettings.success')),
      onError: () => toast.error(t('adminSettings.error')),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('adminSettings.title')}</h1>
        <p className="text-sm text-slate-500">{t('adminSettings.description')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-slate-500">{t('common.loading')}</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.siteName')}</label>
                  <Input name="site_name" value={formState.site_name} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.siteNameEn')}</label>
                  <Input name="site_name_en" value={formState.site_name_en} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.supportEmail')}</label>
                  <Input
                    type="email"
                    name="support_email"
                    value={formState.support_email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.supportPhone')}</label>
                  <Input
                    name="support_phone"
                    value={formState.support_phone}
                    onChange={handleChange}
                    placeholder="+966..."
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr,0.6fr]">
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.logo')}</label>
                  <Input type="file" accept="image/*" onChange={handleLogoChange} />
                  <p className="mt-1 text-xs text-slate-400">{t('adminSettings.logoHint')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t('adminSettings.logoPreview')}</p>
                  {logoPreview ? (
                    <div className="mt-2 rounded-2xl border border-dashed border-slate-300 p-4">
                      <img
                        src={logoPreview}
                        alt={formState.site_name || formState.site_name_en || t('brand')}
                        className="mx-auto h-16 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">{t('adminSettings.noLogo')}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? t('adminSettings.saving') : t('adminSettings.save')}
                </Button>
              </div>
            </>
          )}
        </Card>
      </form>
    </div>
  )
}

export default AdminSettingsPage
