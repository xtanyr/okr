import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const token = useUserStore((s) => s.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
} 