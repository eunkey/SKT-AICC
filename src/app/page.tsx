'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoggedIn, _hasHydrated, mounted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
