import FAQSection from '@/components/FAQSection'

export default function FAQsPage() {
  return (
    <div className="min-h-screen font-source-sans">
      {/* H1 oculto para SEO */}
      <h1 className="sr-only">
        Preguntas Frecuentes - Eleven Club | Rooftop Bar Mar del Plata
      </h1>
      <FAQSection />
    </div>
  )
}
