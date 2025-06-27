import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Carta del Bar - Eleven Club",
  description: "Descubre nuestra selección de cócteles, cervezas y bebidas. Experiencia gastronómica única en Eleven Club.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#1e293b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carta Eleven Club"
  }
}

export default function CartaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {children}
    </div>
  )
}
