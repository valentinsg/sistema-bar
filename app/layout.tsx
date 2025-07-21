import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"
import { Inter, Source_Sans_3 } from "next/font/google"
import Script from "next/script"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans"
})

export const metadata: Metadata = {
  title: "Eleven Club - Club Nocturno",
  description: "Reserva tu lugar, eleva tus sentidos. Experiencia gastronómica y nocturna de primer nivel",
  generator: 'v0.dev',
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
