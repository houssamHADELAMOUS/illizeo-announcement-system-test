import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import TenantRegistrationForm from '@/pages/TenantRegistrationForm'
import MyAnnouncements from '@/pages/MyAnnouncements'
import AdminUserAnnouncements from '@/pages/AdminUserAnnouncements'
import UsersPage from '@/pages/Users'
import DashboardLayout from '@/layouts/DashboardLayout'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/shared/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <TenantRegistrationForm />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'announcements',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'my-announcements',
        element: <MyAnnouncements />,
      },
      {
        path: 'user-announcements',
        element: (
          <AdminRoute>
            <AdminUserAnnouncements />
          </AdminRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    // Catch-all redirect to dashboard
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
