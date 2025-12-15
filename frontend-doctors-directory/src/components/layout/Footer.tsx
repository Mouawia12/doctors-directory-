import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSiteSettingsQuery } from '@/features/settings/hooks'
import { useNewsletterSubscribe } from '@/features/newsletter/hooks'
import { cn } from '@/lib/utils'

const socialLinks = [
  { id: 'facebook', href: 'https://facebook.com', Icon: Facebook },
  { id: 'instagram', href: 'https://instagram.com', Icon: Instagram },
  { id: 'linkedin', href: 'https://linkedin.com', Icon: Linkedin },
] as const

const quickLinkPaths = [
  { id: 'about', href: '/about' },
  { id: 'terms', href: '/terms' },
  { id: 'privacy', href: '/privacy' },
  { id: 'contact', href: '/contact' },
  { id: 'faq', href: '/faq' },
] as const

export const Footer = () => {
  const { t, i18n } = useTranslation()
  const { data: siteSettings } = useSiteSettingsQuery()
  const subscribeMutation = useNewsletterSubscribe()
  const [email, setEmail] = useState('')
  const direction = i18n.dir()
  const year = new Date().getFullYear()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error(t('footer.newsletterError'))
      return
    }

    subscribeMutation.mutate(
      { email: trimmed, source: 'footer' },
      {
        onSuccess: () => {
          toast.success(t('footer.newsletterSuccess'))
          setEmail('')
        },
        onError: () => toast.error(t('footer.newsletterError')),
      },
    )
  }

  const siteName =
    i18n.language === 'ar'
      ? siteSettings?.site_name ?? t('footer.title')
      : siteSettings?.site_name_en ?? siteSettings?.site_name ?? t('footer.title')
  const supportEmail = siteSettings?.support_email ?? t('footer.contactEmail')
  const supportPhone = siteSettings?.support_phone ?? t('footer.contactPhone')
  const footerDescription =
    i18n.language === 'ar'
      ? siteSettings?.footer_description ?? t('footer.description')
      : siteSettings?.footer_description_en ?? siteSettings?.footer_description ?? t('footer.description')
  const newsletterTitle =
    i18n.language === 'ar'
      ? siteSettings?.newsletter_title ?? t('footer.newsletterTitle')
      : siteSettings?.newsletter_title_en ?? siteSettings?.newsletter_title ?? t('footer.newsletterTitle')
  const newsletterDescription =
    i18n.language === 'ar'
      ? siteSettings?.newsletter_description ?? t('footer.newsletterDescription')
      : siteSettings?.newsletter_description_en ??
        siteSettings?.newsletter_description ??
        t('footer.newsletterDescription')
  const newsletterPlaceholder =
    i18n.language === 'ar'
      ? siteSettings?.newsletter_placeholder ?? t('footer.newsletterPlaceholder')
      : siteSettings?.newsletter_placeholder_en ??
        siteSettings?.newsletter_placeholder ??
        t('footer.newsletterPlaceholder')

  const siteQuickLinks = siteSettings?.footer_links?.filter((link) => link.href) ?? []
  const quickLinks = siteQuickLinks.length > 0 ? siteQuickLinks : quickLinkPaths
  const social = siteSettings?.social_links ?? {}

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-white" dir={direction}>
      <div className="container grid gap-8 py-12 md:grid-cols-[1.4fr,1fr,1fr,1.3fr]">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-white">{siteName}</p>
          <p className="text-sm text-white/80">{footerDescription}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {t('footer.quickLinksTitle')}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {quickLinks.map((link) => {
              const isIdLink = 'id' in link && link.id
              const customLabel =
                i18n.language === 'ar'
                  ? (link as any).label ?? (link as any).label_en
                  : (link as any).label_en ?? (link as any).label
              const label = isIdLink
                ? t(`footer.quickLinks.${link.id as string}`, {
                    defaultValue: customLabel ?? undefined,
                  })
                : customLabel ?? link.href

              return (
                <li key={link.id ?? link.href}>
                  <a href={link.href} className="transition hover:text-primary-200">
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{t('footer.contactTitle')}</p>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span dir="ltr">{supportPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Mail className="h-4 w-4" aria-hidden="true" />
            <a href={`mailto:${supportEmail}`} className="hover:text-primary-200">
              {supportEmail}
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">{t('footer.socialTitle')}</p>
            <div className="flex gap-3">
              {socialLinks.map(({ id, href, Icon }) => (
                <a
                  key={id}
                  href={social[id] || href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-primary-200 hover:text-primary-200',
                    social[id] ? '' : 'pointer-events-none opacity-40',
                  )}
                  aria-label={id}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {newsletterTitle}
          </p>
          <p className="text-sm text-white/80">{newsletterDescription}</p>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              dir="ltr"
              value={email}
              placeholder={newsletterPlaceholder}
              onChange={(event) => setEmail(event.target.value)}
              className="border-white/30 bg-white/10 text-white placeholder:text-white/60"
            />
            <Button type="submit" className="bg-white text-primary-700 hover:bg-white/90">
              {t('footer.newsletterCta')}
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-4 py-6 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteName}. {t('footer.rights')}
          </p>
          <div className="flex gap-4">
            {(quickLinks.length ? quickLinks : quickLinkPaths).slice(0, 3).map((link) => (
              <a key={link.id ?? link.href} href={link.href} className="hover:text-primary-200">
                {'id' in link && link.id
                  ? t(`footer.quickLinks.${link.id as string}`, {
                      defaultValue:
                        i18n.language === 'ar'
                          ? (link as any).label ?? (link as any).label_en
                          : (link as any).label_en ?? (link as any).label,
                    })
                  : i18n.language === 'ar'
                    ? (link as any).label ?? (link as any).label_en ?? link.href
                    : (link as any).label_en ?? (link as any).label ?? link.href}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
