import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"
import { Inter, Source_Sans_3 } from "next/font/google"
import Script from "next/script"
import type React from "react"
import "./globals.css"

// Datos estructurados para SEO Local
const structuredData = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  "name": "Eleven Club",
  "description": "El primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales.",
  "url": "https://elevenclub.com.ar",
  "logo": "https://elevenclub.com.ar/eleven_club_logo.webp",
  "image": "https://elevenclub.com.ar/FONDOS-01.webp",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Diagonal Pueyrredón 2970",
    "addressLocality": "Mar del Plata",
    "addressRegion": "Buenos Aires",
    "postalCode": "B7600",
    "addressCountry": "AR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -38.0173,
    "longitude": -57.5502
  },
  "openingHours": "Mo-Su 20:00-02:30",
  "telephone": "+2236859717",
  "priceRange": "$$",
  "servesCuisine": ["Cocktails", "Bebidas", "Tragos de Autor"],
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Vista desde el rooftop",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Tragos de Autor",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "DJ en vivo",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Eventos especiales",
      "value": true
    },
  ],
  "sameAs": [
    "https://www.instagram.com/elevenclubok"
  ]
}

const inter = Inter({ subsets: ["latin"] })
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans"
})

export const metadata: Metadata = {
  title: "Eleven Club - Rooftop Bar & Public House | Mar del Plata | Tragos de Autor",
  description: "El primer rooftop bar de Mar del Plata. Vista panorámica, tragos de autor, DJs en vivo y eventos especiales. Reservá tu experiencia única en Eleven Club.",
  keywords: "rooftop bar Mar del Plata, tragos de autor, DJ en vivo, Public House, coctelería, eventos especiales, bar nocturno, vista panorámica",
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
    canonical: '/',
  },
  openGraph: {
    title: "Eleven Club - Rooftop Bar & Public House | Mar del Plata",
    description: "El primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales.",
    url: 'https://elevenclub.com.ar',
    siteName: 'Eleven Club',
    images: [
      {
        url: '/eleven_club_logo.webp',
        width: 1200,
        height: 630,
        alt: 'Eleven Club - Rooftop Bar Mar del Plata',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Eleven Club - Rooftop Bar & Public House | Mar del Plata",
    description: "El primer rooftop bar de Mar del Plata. Vista panorámica al mar, tragos de autor, DJs en vivo y eventos especiales.",
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
  icons: {
    icon: '/logo-eleven.webp',
    shortcut: '/logo-eleven.webp',
    apple: '/logo-eleven.webp',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${sourceSans.variable}`}>
      <head>
        {/* Datos Estructurados Schema.org */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1481766756163592');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1481766756163592&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${inter.className} ${sourceSans.variable}`} suppressHydrationWarning>
        {children}
        <Footer />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={3000}
          expand={false}
          visibleToasts={3}
        />
      </body>
    </html>
  )
}
