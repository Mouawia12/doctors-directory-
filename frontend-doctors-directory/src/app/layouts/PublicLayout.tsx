import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner'

export const PublicLayout = () => (
  <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
    <EmailVerificationBanner />
    <Navbar />
    <main className="flex-1 pb-16 pt-10">
      <Outlet />
    </main>
    <Footer />
  </div>
)
