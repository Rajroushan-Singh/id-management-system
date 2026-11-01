import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { SessionsPage } from '../pages/SessionsPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AuditEventsPage } from '../pages/AuditEventsPage';
import { LoginRiskPage } from '../pages/LoginRiskPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  // Authenticated App Routes
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/app',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/users',
        element: (
          <RoleRoute requiredRole="ADMIN">
            <UsersPage />
          </RoleRoute>
        ),
      },
      {
        path: '/sessions',
        element: <SessionsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      // Admin Only Routes
      {
        path: '/admin',
        element: (
          <RoleRoute requiredRole="ADMIN">
            <AdminDashboardPage />
          </RoleRoute>
        ),
      },
      {
        path: '/admin/audit',
        element: (
          <RoleRoute requiredRole="ADMIN">
            <AuditEventsPage />
          </RoleRoute>
        ),
      },
      {
        path: '/admin/audit/email/:email',
        element: (
          <RoleRoute requiredRole="ADMIN">
            <AuditEventsPage />
          </RoleRoute>
        ),
      },
      {
        path: '/admin/login-risk',
        element: (
          <RoleRoute requiredRole="ADMIN">
            <LoginRiskPage />
          </RoleRoute>
        ),
      },
      {
        path: '/forbidden',
        element: <ForbiddenPage />,
      },
    ],
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
