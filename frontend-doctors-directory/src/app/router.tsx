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
import DoctorProfileFormPage from '@/pages/doctor/DoctorProfileFormPage'
import DoctorPendingReviewPage from '@/pages/doctor/DoctorPendingReviewPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminDoctorsPage from '@/pages/admin/AdminDoctorsPage'
import AdminDoctorDetailsPage from '@/pages/admin/AdminDoctorDetailsPage'
import AdminDoctorFormPage from '@/pages/admin/AdminDoctorFormPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
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
    path: '/doctor',
    element: (
      <ProtectedRoute roles={['doctor']}>
        <AccountLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'profile', element: <DoctorProfileFormPage /> },
      { path: 'pending', element: <DoctorPendingReviewPage /> },
    ],
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
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
