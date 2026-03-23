import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: 'MediCare - Modern Healthcare Management',
    template: '%s | MediCare'
  },
  description: 'MediCare is a comprehensive hospital management system that enables patients to book appointments with expert doctors and manage their health records online.',
  keywords: ['hospital', 'appointments', 'healthcare', 'doctors', 'medical', 'appointment booking'],
  authors: [{ name: 'MediCare Team' }],
  creator: 'MediCare',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://medicare.example.com',
    siteName: 'MediCare',
    title: 'MediCare - Modern Healthcare Management',
    description: 'Book appointments with expert doctors and manage your health records online.',
    images: [
      {
        url: '/apple-icon.png',
        width: 1200,
        height: 630,
        alt: 'MediCare Healthcare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediCare - Modern Healthcare Management',
    description: 'Book appointments with expert doctors and manage your health records online.',
    images: ['/apple-icon.png'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Analytics />
      </body>
    </html>
  )
}

