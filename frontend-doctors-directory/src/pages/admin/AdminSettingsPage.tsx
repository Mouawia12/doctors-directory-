import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useAdminSiteSettingsQuery, useUpdateAdminSiteSettings } from '@/features/settings/hooks'
import { toast } from 'sonner'

interface SettingsFormState {
  site_name: string
  site_name_en: string
  support_email: string
  support_phone: string
  footer_description: string
  footer_description_en: string
  newsletter_title: string
  newsletter_title_en: string
  newsletter_description: string
  newsletter_description_en: string
  newsletter_placeholder: string
  newsletter_placeholder_en: string
  social_links: {
    facebook: string
    instagram: string
    linkedin: string
  }
  footer_links: Array<{ id: string; href: string; label: string; label_en: string }>
  static_pages: Array<{ slug: string; title: string; title_en: string; body: string; body_en: string }>
}

export const AdminSettingsPage = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminSiteSettingsQuery()
  const mutation = useUpdateAdminSiteSettings()
  const defaultFooterLinks: Array<{ id: string; href: string; label: string; label_en: string }> = [
    { id: 'about', href: '/about', label: '', label_en: '' },
    { id: 'terms', href: '/terms', label: '', label_en: '' },
    { id: 'privacy', href: '/privacy', label: '', label_en: '' },
    { id: 'contact', href: '/contact', label: '', label_en: '' },
    { id: 'faq', href: '/faq', label: '', label_en: '' },
  ]
  const [formState, setFormState] = useState<SettingsFormState>({
    site_name: '',
    site_name_en: '',
    support_email: '',
    support_phone: '',
    footer_description: '',
    footer_description_en: '',
    newsletter_title: '',
    newsletter_title_en: '',
    newsletter_description: '',
    newsletter_description_en: '',
    newsletter_placeholder: '',
    newsletter_placeholder_en: '',
    social_links: {
      facebook: '',
      instagram: '',
      linkedin: '',
    },
    footer_links: defaultFooterLinks,
    static_pages: [
      { slug: 'about', title: '', title_en: '', body: '', body_en: '' },
      { slug: 'privacy', title: '', title_en: '', body: '', body_en: '' },
      { slug: 'terms', title: '', title_en: '', body: '', body_en: '' },
      { slug: 'faq', title: '', title_en: '', body: '', body_en: '' },
      { slug: 'contact', title: '', title_en: '', body: '', body_en: '' },
    ],
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
        footer_description: data.footer_description ?? '',
        footer_description_en: data.footer_description_en ?? '',
        newsletter_title: data.newsletter_title ?? '',
        newsletter_title_en: data.newsletter_title_en ?? '',
        newsletter_description: data.newsletter_description ?? '',
        newsletter_description_en: data.newsletter_description_en ?? '',
        newsletter_placeholder: data.newsletter_placeholder ?? '',
        newsletter_placeholder_en: data.newsletter_placeholder_en ?? '',
        social_links: {
          facebook: data.social_links?.facebook ?? '',
          instagram: data.social_links?.instagram ?? '',
          linkedin: data.social_links?.linkedin ?? '',
        },
        footer_links: defaultFooterLinks.map((link) => {
          const incoming = data.footer_links?.find((item) => item.id === link.id)
          if (incoming) {
            return {
              id: incoming.id ?? link.id,
              href: incoming.href,
              label: incoming.label ?? '',
              label_en: incoming.label_en ?? '',
            }
          }
          return link
        }),
        static_pages: formState.static_pages.map((page) => {
          const incoming = data.static_pages?.find((item) => item.slug === page.slug)
          if (incoming) {
            return {
              slug: incoming.slug,
              title: incoming.title ?? '',
              title_en: incoming.title_en ?? '',
              body: incoming.body ?? '',
              body_en: incoming.body_en ?? '',
            }
          }
          return page
        }),
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

  const handleSocialChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [name]: value },
    }))
  }

  const handleFooterLinkChange = (
    index: number,
    field: 'href' | 'label' | 'label_en',
    value: string,
  ) => {
    setFormState((prev) => {
      const nextLinks = [...prev.footer_links]
      nextLinks[index] = { ...nextLinks[index], [field]: value }
      return { ...prev, footer_links: nextLinks }
    })
  }

  const [activePageIndex, setActivePageIndex] = useState<number | null>(null)

  const handleStaticPageChange = (index: number, field: 'title' | 'title_en' | 'body' | 'body_en', value: string) => {
    setFormState((prev) => {
      const nextPages = [...prev.static_pages]
      nextPages[index] = { ...nextPages[index], [field]: value }
      return { ...prev, static_pages: nextPages }
    })
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
    formData.append('footer_description', formState.footer_description)
    formData.append('footer_description_en', formState.footer_description_en)
    formData.append('newsletter_title', formState.newsletter_title)
    formData.append('newsletter_title_en', formState.newsletter_title_en)
    formData.append('newsletter_description', formState.newsletter_description)
    formData.append('newsletter_description_en', formState.newsletter_description_en)
    formData.append('newsletter_placeholder', formState.newsletter_placeholder)
    formData.append('newsletter_placeholder_en', formState.newsletter_placeholder_en)
    const socialEntries = Object.entries(formState.social_links).filter(([, value]) => value.trim() !== '')
    socialEntries.forEach(([key, value]) => {
      formData.append(`social_links[${key}]`, value.trim())
    })
    formState.footer_links.forEach((link, index) => {
      formData.append(`footer_links[${index}][id]`, link.id)
      formData.append(`footer_links[${index}][href]`, link.href)
      formData.append(`footer_links[${index}][label]`, link.label)
      formData.append(`footer_links[${index}][label_en]`, link.label_en)
    })
    formState.static_pages.forEach((page, index) => {
      formData.append(`static_pages[${index}][slug]`, page.slug)
      formData.append(`static_pages[${index}][title]`, page.title)
      formData.append(`static_pages[${index}][title_en]`, page.title_en)
      formData.append(`static_pages[${index}][body]`, page.body)
      formData.append(`static_pages[${index}][body_en]`, page.body_en)
    })
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
                  dir="ltr"
                  name="support_phone"
                  value={formState.support_phone}
                  onChange={handleChange}
                  placeholder="+966..."
                />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.footerDescription')}</label>
                  <Input
                    name="footer_description"
                    value={formState.footer_description}
                    onChange={handleChange}
                    placeholder={t('adminSettings.placeholders.footerDescription')}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('adminSettings.fields.footerDescriptionEn')}</label>
                  <Input
                    name="footer_description_en"
                    value={formState.footer_description_en}
                    onChange={handleChange}
                    placeholder={t('adminSettings.placeholders.footerDescriptionEn')}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">{t('adminSettings.sections.newsletter')}</label>
                  <Input
                    name="newsletter_title"
                    value={formState.newsletter_title}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterTitle')}
                  />
                  <Input
                    name="newsletter_description"
                    value={formState.newsletter_description}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterDescription')}
                  />
                  <Input
                    name="newsletter_placeholder"
                    value={formState.newsletter_placeholder}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">{t('adminSettings.sections.newsletterEn')}</label>
                  <Input
                    name="newsletter_title_en"
                    value={formState.newsletter_title_en}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterTitle')}
                  />
                  <Input
                    name="newsletter_description_en"
                    value={formState.newsletter_description_en}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterDescription')}
                  />
                  <Input
                    name="newsletter_placeholder_en"
                    value={formState.newsletter_placeholder_en}
                    onChange={handleChange}
                    placeholder={t('adminSettings.fields.newsletterPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">{t('adminSettings.sections.social')}</label>
                  <Input
                    name="facebook"
                    value={formState.social_links.facebook}
                    onChange={handleSocialChange}
                    placeholder="https://facebook.com/..."
                  />
                  <Input
                    name="instagram"
                    value={formState.social_links.instagram}
                    onChange={handleSocialChange}
                    placeholder="https://instagram.com/..."
                  />
                  <Input
                    name="linkedin"
                    value={formState.social_links.linkedin}
                    onChange={handleSocialChange}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">{t('adminSettings.sections.quickLinks')}</label>
                  <div className="space-y-2">
                    {formState.footer_links.map((link, index) => (
                      <div key={link.id} className="grid gap-2 rounded-xl border border-slate-200 p-3">
                        <div className="text-xs font-semibold text-slate-600">{link.id}</div>
                        <Input
                          value={link.href}
                          onChange={(e) => handleFooterLinkChange(index, 'href', e.target.value)}
                          placeholder="/about"
                        />
                        <Input
                          value={link.label}
                          onChange={(e) => handleFooterLinkChange(index, 'label', e.target.value)}
                          placeholder={t('adminSettings.placeholders.linkLabel')}
                        />
                        <Input
                          value={link.label_en}
                          onChange={(e) => handleFooterLinkChange(index, 'label_en', e.target.value)}
                          placeholder={t('adminSettings.placeholders.linkLabelEn')}
                        />
                      </div>
                    ))}
                  </div>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t('adminSettings.sections.pages')}</p>
                    <p className="text-xs text-slate-500">{t('adminSettings.pagesHint')}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {formState.static_pages.map((page, index) => (
                    <div key={page.slug} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{page.slug}</p>
                          <p className="text-xs text-slate-500">{t('adminSettings.pagesEdit')}</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setActivePageIndex(index)}>
                          {t('common.actions.edit')}
                        </Button>
                      </div>
                    </div>
                  ))}
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
      {activePageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                  {t('adminSettings.pagesModalTitle')}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">{formState.static_pages[activePageIndex].slug}</h2>
              </div>
              <Button variant="outline" onClick={() => setActivePageIndex(null)}>
                {t('common.actions.close')}
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">{t('common.title')} (AR)</label>
                <Input
                  value={formState.static_pages[activePageIndex].title}
                  onChange={(e) => handleStaticPageChange(activePageIndex, 'title', e.target.value)}
                />
                <label className="text-xs font-semibold text-slate-600">{t('common.content')} (AR)</label>
                <Textarea
                  rows={8}
                  value={formState.static_pages[activePageIndex].body}
                  onChange={(e) => handleStaticPageChange(activePageIndex, 'body', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">{t('common.title')} (EN)</label>
                <Input
                  value={formState.static_pages[activePageIndex].title_en}
                  onChange={(e) => handleStaticPageChange(activePageIndex, 'title_en', e.target.value)}
                />
                <label className="text-xs font-semibold text-slate-600">{t('common.content')} (EN)</label>
                <Textarea
                  rows={8}
                  value={formState.static_pages[activePageIndex].body_en}
                  onChange={(e) => handleStaticPageChange(activePageIndex, 'body_en', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActivePageIndex(null)}>
                {t('common.actions.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettingsPage
