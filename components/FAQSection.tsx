'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import Script from 'next/script'

const faqs = [
  {
    question: '¿Qué tipo de música pasan en Eleven Club?',
    answer:
      'En Eleven vas a escuchar sets en vivo con DJs de música house, indie-electrónica y mezclas que elevan la experiencia nocturna. Cada noche es una propuesta sonora única que complementa perfectamente nuestros tragos de autor.',
  },
  {
    question: '¿Cuáles son los días y horarios de apertura?',
    answer:
      'Abrimos todos los días desde las 20:00 hasta las 02:30. Consultá nuestro Instagram @elevenclubok para eventos especiales y fechas con horarios extendidos.',
  },
  {
    question: '¿Se puede reservar mesa? ¿Cómo?',
    answer:
      'Sí, podés reservar desde nuestra web o por mensaje en Instagram. Recomendamos hacerlo con anticipación, especialmente para fines de semana. El sistema de reservas es gratuito y te confirmamos por WhatsApp.',
  },
  {
    question: '¿Cuál es la dirección exacta de Eleven Club?',
    answer:
      'Estamos en Diagonal Pueyrredón 2970, piso 11, en el centro de Mar del Plata. Somos un rooftop bar con vistas increíbles de la ciudad, fácil de encontrar y con estacionamiento disponible.',
  },
  {
    question: '¿Hay dress code o requisitos para entrar?',
    answer:
      'No hay dress code estricto, pero sugerimos un look cuidado. La vibra es relajada pero con estilo. Lo importante es que te sientas cómodo y disfrutes del ambiente.',
  },
  {
    question: '¿Qué tragos ofrecen?',
    answer:
      'Nuestra carta incluye cócteles de autor, opciones clásicas y mezclas originales creadas por bartenders expertos. Podés ver la carta completa de tragos en nuestra sección de carta. También tenemos opciones sin alcohol.',
  },
  {
    question: '¿Se puede ir solo a tomar algo o hay que ir a bailar?',
    answer:
      'Claro. Podés venir a tomar algo y disfrutar el ambiente sin necesidad de salir a bailar. Eleven es tanto un lugar para socializar como para disfrutar de buena música y tragos.',
  },
  {
    question: '¿Se puede ir con grupo grande o hacer eventos privados?',
    answer:
      'Sí, recibimos grupos y organizamos eventos privados. Escribinos desde la web o por Instagram para coordinar fechas y opciones especiales para tu grupo.',
  },
  {
    question: '¿Cuánto cuesta la entrada o el acceso?',
    answer:
      'La entrada puede variar según el evento. Seguinos en @elevenclubok para info actualizada sobre precios y eventos especiales. Algunas noches son gratuitas.',
  },
  {
    question: '¿Hay opciones para personas que no toman alcohol?',
    answer:
      'Sí, tenemos tragos sin alcohol, mocktails y otras opciones refrescantes. Nuestros bartenders crean bebidas deliciosas para todos los gustos y preferencias.',
  },
  {
    question: '¿Cuál es la edad mínima para entrar?',
    answer:
      'El ingreso es a partir de los 18 años con DNI en mano. Es obligatorio presentar identificación válida al ingresar.',
  },
  {
    question: '¿Dónde puedo ver fotos del lugar y la carta?',
    answer:
      'En nuestro Instagram @elevenclubok y próximamente en la galería de nuestra web. Ahí podés ver el ambiente, los tragos y las mejores fotos del rooftop.',
  },
  {
    question: '¿Cómo funciona el sistema de reservas desde la web?',
    answer:
      'Desde la web completás un formulario, elegís día y cantidad de personas, y te confirmamos por WhatsApp. Es un proceso simple y rápido que te asegura tu lugar.',
  },
  {
    question: '¿Hay que pagar para reservar?',
    answer:
      'No, la reserva es sin costo. Solo pedimos que llegues en horario para mantener tu lugar. Es un servicio gratuito para mejorar tu experiencia.',
  },
  {
    question: '¿Qué diferencia a Eleven de otros bares nocturnos?',
    answer:
      'Somos una Public House con una propuesta sonora única, tragos de autor y un ambiente cuidado, con una experiencia distinta cada noche. El rooftop y la atención personalizada nos hacen únicos en Mar del Plata.',
  },
]

// Datos estructurados para SEO
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function FAQSection() {
  return (
    <section className="relative min-h-screen bg-black font-source-sans overflow-hidden">
      {/* Background con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header con animaciones */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.h2
            className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            Preguntas Frecuentes
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-orange-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          >
            Todo lo que necesitás saber sobre Eleven Club
          </motion.p>
        </motion.div>

        {/* FAQ Accordion con diseño mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.2 + index * 0.1,
                  ease: 'easeOut',
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-white/10 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left py-6 px-6 hover:no-underline group">
                    <h3 className="font-legquinne text-white text-lg md:text-xl pr-8 group-hover:text-orange-200 transition-colors duration-300">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-6 border border-white/5">
                      <p className="text-gray-200 leading-relaxed text-lg font-source-sans">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Footer con CTA mejorado */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5, ease: 'easeOut' }}
        >
          <motion.div
            className="p-8 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.7, ease: 'easeOut' }}
          >
            <p className="text-gray-300 text-lg mb-6 font-source-sans">
              ¿No encontraste lo que buscabas?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://www.instagram.com/elevenclubok"
                className="relative inline-flex items-center px-8 py-4 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Fondo con imagen */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/FONDOS-01.webp)' }}
                ></div>
                {/* Overlay para mejorar legibilidad */}
                <div className="absolute inset-0 transition-all duration-300"></div>
                {/* Contenido del botón */}
                <div className="relative z-10 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Escribinos en Instagram
                </div>
              </motion.a>
              <motion.a
                href="/sobre"
                className="inline-flex items-center px-8 py-4 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Conocé más sobre nosotros
              </motion.a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
