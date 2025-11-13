import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ar: {
    translation: {
      brand: 'دليل المعالجين النفسيين',
      nav: {
        specialists: 'التخصصات',
        search: 'ابحث عن معالج',
        favorites: 'مفضلتي',
        doctorPortal: 'بوابة المعالجين',
        admin: 'لوحة التحكم',
      },
      hero: {
        title: 'منصتك الذكية للعثور على أفضل المعالجين النفسيين',
        subtitle:
          'استكشف نخبة من الأخصائيين النفسيين الموثوقين، قارن بين أساليب العلاج، واحجز جلساتك بثقة وخصوصية.',
        cta: 'ابحث عن معالج',
        doctorCta: 'انضم كممارس نفسي معتمد',
      },
      search: {
        quick: 'بحث علاجي سريع',
        city: 'المدينة',
        specialty: 'التخصص النفسي',
        keywords: 'اسم المعالج أو الكلمات المفتاحية',
        submit: 'اعرض المعالجين',
      },
      auth: {
        loginTitle: 'أهلاً بك من جديد',
        registerTitle: 'سجّل كممارس نفسي أو مستخدم',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        name: 'الاسم الكامل',
        role: 'نوع الحساب',
        doctor: 'معالج نفسي',
        user: 'مستخدم',
        submit: 'متابعة',
      },
    },
  },
  en: {
    translation: {
      brand: 'Mental Health Directory',
      nav: {
        specialists: 'Specialties',
        search: 'Find a therapist',
        favorites: 'Favorites',
        doctorPortal: 'Therapist Portal',
        admin: 'Admin Panel',
      },
      hero: {
        title: 'Your trusted hub for licensed mental health therapists',
        subtitle:
          'Browse verified counselors, compare therapy specialties, and book sessions confidentially with ease.',
        cta: 'Find a therapist',
        doctorCta: 'Join as a licensed therapist',
      },
      search: {
        quick: 'Quick therapy search',
        city: 'City',
        specialty: 'Therapy specialty',
        keywords: 'Therapist name or keywords',
        submit: 'Show therapists',
      },
      auth: {
        loginTitle: 'Welcome back',
        registerTitle: 'Register as a therapist or user',
        email: 'Email',
        password: 'Password',
        name: 'Full name',
        role: 'Account type',
        doctor: 'Therapist',
        user: 'User',
        submit: 'Continue',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
