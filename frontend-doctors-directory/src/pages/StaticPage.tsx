import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSiteSettingsQuery } from '@/features/settings/hooks'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

type StaticPageProps = {
  slug: 'about' | 'privacy' | 'terms' | 'faq' | 'contact'
}

const fallbackContent: Record<
  StaticPageProps['slug'],
  { title: { ar: string; en: string }; body: { ar: string; en: string } }
> = {
  about: {
    title: { ar: 'من نحن', en: 'About us' },
    body: {
      ar: 'منصة تجمع نخبة الأخصائيين النفسيين بواجهة سهلة، لتمكينك من المقارنة والحجز بثقة وشفافية.',
      en: 'A curated directory of licensed therapists with a modern experience to compare, connect, and book confidently.',
    },
  },
  privacy: {
    title: { ar: 'سياسة الخصوصية', en: 'Privacy policy' },
    body: {
      ar: 'نحمي بياناتك الشخصية بتشفير وحماية وصول، ولا نشاركها إلا للغرض المتفق عليه.',
      en: 'We protect your personal data with encryption and strict access, and never share it beyond your consented use.',
    },
  },
  terms: {
    title: { ar: 'شروط الاستخدام', en: 'Terms of use' },
    body: {
      ar: 'باستخدامك المنصة تلتزم بسياسات الحجز، التواصل الآمن، واحترام خصوصية الأخصائيين والعملاء.',
      en: 'By using the platform you agree to safe booking, respectful communication, and privacy-first conduct.',
    },
  },
  faq: {
    title: { ar: 'الأسئلة الشائعة', en: 'FAQs' },
    body: {
      ar: 'تعرّف على طريقة البحث، الحجز، والتحقق من الأخصائيين، إضافة إلى خيارات الدفع والاتصال.',
      en: 'Learn how search, booking, therapist verification, and payment/communication options work on the platform.',
    },
  },
  contact: {
    title: { ar: 'تواصل معنا', en: 'Contact us' },
    body: {
      ar: 'فريق الدعم متوفر للإجابة على استفساراتك حول المنصة، الحسابات، والاشتراكات.',
      en: 'Our support team is here to help with platform questions, accounts, and subscriptions.',
    },
  },
}

export const StaticPage = ({ slug }: StaticPageProps) => {
  const { t, i18n } = useTranslation()
  const { data: siteSettings } = useSiteSettingsQuery()
  const navigate = useNavigate()
  const isRTL = i18n.dir() === 'rtl'

  const content = useMemo(() => {
    const pages = siteSettings?.static_pages ?? []
    const match = pages.find((page) => page.slug === slug)
    const langKey = i18n.language.startsWith('ar') ? 'ar' : 'en'
    const fallback = fallbackContent[slug]

    return {
      title:
        langKey === 'ar'
          ? match?.title || match?.title_en || fallback.title.ar
          : match?.title_en || match?.title || fallback.title.en,
      body:
        langKey === 'ar'
          ? match?.body || match?.body_en || fallback.body.ar
          : match?.body_en || match?.body || fallback.body.en,
    }
  }, [i18n.language, siteSettings?.static_pages, slug])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100" dir={i18n.dir()}>
      <div className="container py-12">
        <div className="rounded-3xl bg-white px-6 py-10 shadow-card md:px-10">
          <div className={cn('space-y-3', isRTL ? 'text-right' : 'text-left')}>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
              {t('footer.quickLinksTitle')}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">{content.title}</h1>
            <p className="text-base leading-7 text-slate-700 whitespace-pre-line">{content.body}</p>
          </div>
          <div className={cn('mt-8 flex flex-wrap gap-3', isRTL ? 'justify-end' : 'justify-start')}>
            <Button onClick={() => navigate('/')}>{t('notFound.back')}</Button>
            <Button variant="outline" onClick={() => navigate('/search')}>
              {t('home.cta.primary')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const makeStaticPage = (slug: StaticPageProps['slug']) => () => <StaticPage slug={slug} />

export default StaticPage
