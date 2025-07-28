import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sobre Nosotros - Eleven Club | Rooftop Bar Mar del Plata",
  description: "Conocé la historia de Eleven Club, el primer rooftop bar de Mar del Plata. Vista panorámica, tragos de autor, DJs en vivo y eventos especiales.",
  keywords: "Eleven Club historia, rooftop bar Mar del Plata, Public House, tragos de autor, DJ en vivo, eventos especiales",
  openGraph: {
    title: "Sobre Nosotros - Eleven Club | Rooftop Bar Mar del Plata",
    description: "Conocé la historia de Eleven Club, el primer rooftop bar de Mar del Plata. Vista panorámica, tragos de autor, DJs en vivo y eventos especiales.",
  }
}

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
