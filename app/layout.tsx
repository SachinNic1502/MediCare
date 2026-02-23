import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MediCare - Hospital Management & Appointment Booking',
  description: 'MediCare is a comprehensive hospital management system that enables patients to book appointments with expert doctors and manage their health records online.',
  keywords: ['hospital', 'appointments', 'healthcare', 'doctors', 'medical'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Analytics />
      </body>
    </html>
  )
}
