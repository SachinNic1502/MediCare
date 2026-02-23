'use client';

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/lib/auth-context'
import { usePathname } from 'next/navigation';

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/patient');

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isDashboard && <Header />}
        <main className="flex-1">
          {children}
        </main>
        {!isDashboard && <Footer />}
      </div>
    </AuthProvider>
  )
}
