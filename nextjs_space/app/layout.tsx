
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/session-provider'
import { auth } from '@/lib/auth'
import GoogleAnalytics from '@/components/google-analytics'
import WebVitals from '@/components/web-vitals'

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'NetMinder Hire - Goalkeeper Rental Platform',
  description: 'Find and book professional goalkeepers for your football matches in the Netherlands. Connect with skilled goalkeepers in your area.',
  keywords: 'goalkeeper, rental, football, soccer, Netherlands, booking, sports',
  openGraph: {
    title: 'NetMinder Hire - Goalkeeper Rental Platform',
    description: 'Find and book professional goalkeepers for your football matches in the Netherlands.',
    url: '/',
    siteName: 'NetMinder Hire',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NetMinder Hire - Goalkeeper Rental Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetMinder Hire - Goalkeeper Rental Platform',
    description: 'Find and book professional goalkeepers for your football matches in the Netherlands.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
              {children}
            </div>
            <Toaster />
            <GoogleAnalytics />
            <WebVitals />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
