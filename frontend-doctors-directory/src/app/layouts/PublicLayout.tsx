import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const PublicLayout = () => (
  <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
    <Navbar />
    <main className="flex-1 pb-16 pt-10">
      <Outlet />
    </main>
    <Footer />
  </div>
)
