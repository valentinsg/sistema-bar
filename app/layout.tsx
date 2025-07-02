import type { Metadata } from "next"
import { Inter, Source_Sans_3 } from "next/font/google"
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
      <body className={`${inter.className} ${sourceSans.variable}`} suppressHydrationWarning>{children}</body>
    </html>
  )
}
