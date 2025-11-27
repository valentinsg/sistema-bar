import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Sobre Nosotros - Eleven Club | El Primer Rooftop Bar de Mar del Plata',
  description:
    'Conocé la historia de Eleven Club, el primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales. Una experiencia única en el piso 11.',
  keywords:
    'Eleven Club historia, primer rooftop bar Mar del Plata, Public House, tragos de autor, DJ en vivo, eventos especiales, vista panorámica, piso 11 Mar del Plata',
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
    canonical: '/sobre',
  },
  openGraph: {
    title:
      'Sobre Nosotros - Eleven Club | El Primer Rooftop Bar de Mar del Plata',
    description:
      'Conocé la historia de Eleven Club, el primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales. Una experiencia única en el piso 11.',
    url: 'https://elevenclub.com.ar/sobre',
    siteName: 'Eleven Club',
    images: [
      {
        url: '/FONDOS-02.webp',
        width: 1200,
        height: 630,
        alt: 'Eleven Club - Vista panorámica desde el rooftop',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Sobre Nosotros - Eleven Club | El Primer Rooftop Bar de Mar del Plata',
    description:
      'Conocé la historia de Eleven Club, el primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales.',
    images: ['/FONDOS-02.webp'],
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

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
