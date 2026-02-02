'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/stores';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isLoggedIn, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, _hasHydrated, mounted, router]);

  // 클라이언트 마운트 전에는 로딩 표시
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
