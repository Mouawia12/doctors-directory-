import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSiteSettingsQuery } from '@/features/settings/hooks'

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

    toast.success(t('footer.newsletterSuccess'))
    setEmail('')
  }

  const siteName =
    i18n.language === 'ar'
      ? siteSettings?.site_name ?? t('footer.title')
      : siteSettings?.site_name_en ?? siteSettings?.site_name ?? t('footer.title')
  const supportEmail = siteSettings?.support_email ?? t('footer.contactEmail')
  const supportPhone = siteSettings?.support_phone ?? t('footer.contactPhone')

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-white" dir={direction}>
      <div className="container grid gap-8 py-12 md:grid-cols-[1.4fr,1fr,1fr,1.3fr]">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-white">{siteName}</p>
          <p className="text-sm text-white/80">{t('footer.description')}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {t('footer.quickLinksTitle')}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {quickLinkPaths.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="transition hover:text-primary-200">
                  {t(`footer.quickLinks.${link.id}`)}
                </a>
              </li>
            ))}
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
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-primary-200 hover:text-primary-200"
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
            {t('footer.newsletterTitle')}
          </p>
          <p className="text-sm text-white/80">{t('footer.newsletterDescription')}</p>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              dir="ltr"
              value={email}
              placeholder={t('footer.newsletterPlaceholder')}
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
            {quickLinkPaths.slice(0, 3).map((link) => (
              <a key={link.id} href={link.href} className="hover:text-primary-200">
                {t(`footer.quickLinks.${link.id}`)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
