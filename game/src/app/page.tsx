'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        window.location.href = '/login';
      }
    }
  }, [router]);

  if (typeof window !== 'undefined' && !sessionStorage.getItem('userId')) {
    return null;
  }

  return (
    <div>
        <LandingPage />
    </div>
  );
}