import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SafeSpace AI - Context-Aware Safety Assistant',
  description:
    'Proactive safety protection with intelligent risk analysis and real-time alerts',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0F1117" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="SafeSpace" />
      </head>
      <body className={`${inter.className} bg-background text-text-primary`}>
        <div className="app-shell min-h-screen bg-background pt-20 pb-6 lg:pt-24">
          {children}
        </div>
      </body>
    </html>
  )
}
