import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes - Eleven Club | Rooftop Bar Mar del Plata',
  description:
    'Resolvé todas tus dudas sobre Eleven Club. Horarios, reservas, tragos de autor, DJs en vivo y más. El rooftop bar más exclusivo de Mar del Plata.',
  keywords:
    'preguntas frecuentes Eleven Club, horarios rooftop bar Mar del Plata, reservas Eleven Club, tragos de autor, DJ en vivo, eventos especiales',
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
    canonical: '/faqs',
  },
  openGraph: {
    title: 'Preguntas Frecuentes - Eleven Club | Rooftop Bar Mar del Plata',
    description:
      'Resolvé todas tus dudas sobre Eleven Club. Horarios, reservas, tragos de autor, DJs en vivo y más. El rooftop bar más exclusivo de Mar del Plata.',
    url: 'https://elevenclub.com.ar/faqs',
    siteName: 'Eleven Club',
    images: [
      {
        url: '/eleven_club_logo.webp',
        width: 1200,
        height: 630,
        alt: 'Eleven Club - Preguntas Frecuentes',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preguntas Frecuentes - Eleven Club | Rooftop Bar Mar del Plata',
    description:
      'Resolvé todas tus dudas sobre Eleven Club. Horarios, reservas, tragos de autor, DJs en vivo y más.',
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
}

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
