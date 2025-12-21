import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { AccountLayout } from '@/app/layouts/AccountLayout'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/SearchPage'
import DoctorProfilePage from '@/pages/DoctorProfilePage'
import FavoritesPage from '@/pages/FavoritesPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import EmailVerificationPendingPage from '@/pages/auth/EmailVerificationPendingPage'
import EmailVerificationSuccessPage from '@/pages/auth/EmailVerificationSuccessPage'
import DoctorProfileFormPage from '@/pages/doctor/DoctorProfileFormPage'
import DoctorProfileOverviewPage from '@/pages/doctor/DoctorProfileOverviewPage'
import DoctorPendingReviewPage from '@/pages/doctor/DoctorPendingReviewPage'
import UserProfilePage from '@/pages/account/UserProfilePage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminDoctorsPage from '@/pages/admin/AdminDoctorsPage'
import AdminDoctorDetailsPage from '@/pages/admin/AdminDoctorDetailsPage'
import AdminDoctorFormPage from '@/pages/admin/AdminDoctorFormPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminAdminsPage from '@/pages/admin/AdminAdminsPage'
import AdminPasswordPage from '@/pages/admin/AdminPasswordPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminNewsletterPage from '@/pages/admin/AdminNewsletterPage'
import StatisticsPage from '@/pages/StatisticsPage'
import { makeStaticPage } from '@/pages/StaticPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'stats', element: <StatisticsPage /> },
      { path: 'about', element: makeStaticPage('about')() },
      { path: 'privacy', element: makeStaticPage('privacy')() },
      { path: 'terms', element: makeStaticPage('terms')() },
      { path: 'faq', element: makeStaticPage('faq')() },
      { path: 'contact', element: makeStaticPage('contact')() },
      { path: 'doctors/:id', element: <DoctorProfilePage /> },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthLayout>
        <ResetPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <AuthLayout>
        <ProtectedRoute allowUnverified>
          <EmailVerificationPendingPage />
        </ProtectedRoute>
      </AuthLayout>
    ),
  },
  {
    path: '/verify-email/success',
    element: (
      <AuthLayout>
        <EmailVerificationSuccessPage />
      </AuthLayout>
    ),
  },
  {
    path: '/doctor',
    element: (
      <ProtectedRoute roles={['doctor']}>
        <AccountLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DoctorProfileOverviewPage /> },
      { path: 'profile', element: <DoctorProfileFormPage /> },
      { path: 'pending', element: <DoctorPendingReviewPage /> },
    ],
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute roles={['user']}>
        <UserProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'doctors', element: <AdminDoctorsPage /> },
      { path: 'doctors/new', element: <AdminDoctorFormPage /> },
      { path: 'doctors/:doctorId', element: <AdminDoctorDetailsPage /> },
      { path: 'doctors/:doctorId/edit', element: <AdminDoctorFormPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'newsletter', element: <AdminNewsletterPage /> },
      { path: 'admins', element: <AdminAdminsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'password', element: <AdminPasswordPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
