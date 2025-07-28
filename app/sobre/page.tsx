"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/FONDOS-02.webp"
            alt="Eleven Club rooftop vista al mar"
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <Image
              src="/eleven_club_logo.webp"
              alt="Eleven Club Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </motion.div>

          <motion.h1
            className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Sobre Eleven Club
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            El primer rooftop bar de Mar del Plata
          </motion.p>
        </motion.div>
      </section>

            {/* Historia Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/FONDOS-01.webp"
            alt="Eleven Club atmosphere"
            fill
            className="object-cover"
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-purple-900/20"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <h2 className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-8">
              Nuestra Historia
            </h2>

            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="space-y-8">
              <motion.div
                className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <p className="text-xl text-gray-200 leading-relaxed mb-6">
                  En el piso 11 del corazón de <strong className="text-white font-semibold">Mar del Plata</strong> nace
                  <strong className="text-white font-semibold"> Eleven Club</strong>, la primera <strong className="text-white font-semibold">Public House</strong>
                  de la ciudad. Nuestro <strong className="text-white font-semibold">rooftop bar</strong> ofrece una vista panorámica
                  al mar que combina <strong className="text-white font-semibold">coctelería de autor</strong>,
                  <strong className="text-white font-semibold"> DJs en vivo</strong> y un ambiente sin filtros.
                </p>

                <p className="text-xl text-gray-200 leading-relaxed">
                  Creemos que la noche es un lienzo. Por eso diseñamos una experiencia nocturna que eleva los sentidos:
                  <strong className="text-white font-semibold"> tragos originales</strong> creados por bartenders locales,
                  música que va del house al indie-electrónico, y la brisa atlántica completando la escena.
                </p>
              </motion.div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✦</span>
                </div>
                <p className="text-orange-300 font-medium">"Eleven Club eleva la experiencia nocturna y baja el filtro"</p>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <Image
                  src="/detalle-texto-eleven.webp"
                  alt="Eleven Club detalle"
                  width={600}
                  height={500}
                  className="relative rounded-2xl shadow-2xl border border-white/10"
                  quality={90}
                />
              </div>

              <motion.div
                className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <span className="text-white text-2xl">11</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

            {/* Experiencia Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/FONDOS-02.webp"
            alt="Eleven Club rooftop"
            fill
            className="object-cover"
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-cyan-900/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <h2 className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-8">
              Nuestra Experiencia
            </h2>

            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-8 leading-relaxed">
              Cada detalle está pensado para que disfrutes momentos únicos sobre la línea del horizonte
            </p>

            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Tragos de Autor */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 h-full">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🍸</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">Tragos de Autor</h3>
                <p className="text-gray-200 text-center leading-relaxed">
                  Cócteles únicos creados por nuestros bartenders expertos,
                  combinando técnicas tradicionales con ingredientes innovadores.
                </p>
              </div>
            </motion.div>

            {/* DJs en Vivo */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 h-full">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎵</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">DJs en Vivo</h3>
                <p className="text-gray-200 text-center leading-relaxed">
                  Música que va del house al indie-electrónico,
                  creando la atmósfera perfecta para tu noche en Eleven Club.
                </p>
              </div>
            </motion.div>

            {/* Vista Panorámica */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 h-full">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🌊</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">Vista Panorámica</h3>
                <p className="text-gray-200 text-center leading-relaxed">
                  Ubicados en el piso 11, disfrutá de la mejor vista panorámica
                  mientras la brisa atlántica completa tu experiencia.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ubicación y Horarios */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-source-sans text-3xl md:text-4xl font-normal text-white mb-6">
              Ubicación y Horarios
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Ubicación */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">📍 Ubicación</h3>
              <div className="space-y-4">
                <p className="text-lg text-gray-300">
                  <strong className="text-white">Eleven Club</strong><br />
                  Diagonal Pueyrredón 2970<br />
                  Mar del Plata, Buenos Aires
                </p>
                <p className="text-gray-300">
                  Estamos a pasos de Playa Grande, en el corazón de Mar del Plata,
                  ofreciendo la mejor vista panorámica al mar desde el piso 11.
                </p>
              </div>
            </div>

            {/* Horarios */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">🕐 Horarios</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 rounded-lg border border-orange-500/20">
                  <p className="text-lg text-white font-semibold mb-2">Horarios de Funcionamiento</p>
                  <p className="text-gray-300">
                    <strong>Lunes a Domingo:</strong> 20:00 - 02:30<br />
                    <strong>Eventos Especiales:</strong> Consultar programación
                  </p>
                </div>
                <p className="text-gray-300">
                  Abiertos todo el año con eventos especiales y sesiones de DJ
                  que mantienen la vibra alta hasta el amanecer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-orange-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-source-sans text-3xl md:text-4xl font-normal text-white mb-6">
              Sumate a Nuestra Comunidad
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Descubrí por qué Eleven Club es el rooftop de referencia en Mar del Plata.
              Reservá tu experiencia única y elevá tus sentidos.
            </p>

            <motion.button
              onClick={() => {
                window.location.href = '/'
              }}
              className="inline-flex items-center gap-3 px-8 py-4 border border-white/30 rounded-full text-xl text-white/95 font-light hover:border-white/50 hover:bg-white/5 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Reservá tu Experiencia</span>
              <span className="text-white/70">→</span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
