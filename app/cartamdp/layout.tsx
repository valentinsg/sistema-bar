import type { Metadata, Viewport } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'Carta de Tragos y Bebidas - Eleven Club | Rooftop Bar Mar del Plata',
  description:
    'Descubrí nuestra exclusiva carta de cócteles de autor, tragos clásicos, whiskies premium y más. Los mejores bartenders de Mar del Plata te esperan en Eleven Club.',
  keywords:
    'carta Eleven Club, cócteles de autor Mar del Plata, tragos premium, whiskies, gin, ron, champagne, rooftop bar carta',
  authors: [{ name: 'Valentín Sánchez Guevara' }],
  creator: 'Valentín Sánchez Guevara',
  publisher: 'Eleven Club',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elevenclub.com.ar'),
  alternates: {
    canonical: '/cartamdp',
  },
  openGraph: {
    title:
      'Carta de Tragos y Bebidas - Eleven Club | Rooftop Bar Mar del Plata',
    description:
      'Descubrí nuestra exclusiva carta de cócteles de autor, tragos clásicos, whiskies premium y más. Los mejores bartenders de Mar del Plata te esperan en Eleven Club.',
    url: 'https://elevenclub.com.ar/cartamdp',
    siteName: 'Eleven Club',
    images: [
      {
        url: '/eleven_club_logo.webp',
        width: 1200,
        height: 630,
        alt: 'Eleven Club - Carta de Tragos',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Carta de Tragos y Bebidas - Eleven Club | Rooftop Bar Mar del Plata',
    description:
      'Descubrí nuestra exclusiva carta de cócteles de autor, tragos clásicos, whiskies premium y más.',
    images: ['/eleven_club_logo.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Carta Eleven Club',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e293b',
}

export default function CartaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
