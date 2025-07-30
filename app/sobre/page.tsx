'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-black font-source-sans">
      {/* Hero Section */}
      <section className="relative font-source-sans flex items-center justify-center min-h-screen overflow-hidden">
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
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
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
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            Sobre Eleven Club
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            Un Rooftop Bar, en el corazón de Mar del Plata.
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
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <h2 className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6">
              Nuestra Historia
            </h2>

            <motion.div
              className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="space-y-10">
              <motion.div
                className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <p className="text-xl text-gray-200 font-source-sans leading-relaxed mb-8">
                  En el piso 11 del corazón de{' '}
                  <strong className="text-white font-semibold">
                    Mar del Plata
                  </strong>{' '}
                  nace
                  <strong className="text-white font-semibold">
                    {' '}
                    Eleven Club
                  </strong>
                  , una nueva{' '}
                  <strong className="text-white font-semibold">
                    Public House{' '}
                  </strong>
                  en la ciudad. Nuestro{' '}
                  <strong className="text-white font-semibold">
                    rooftop bar
                  </strong>{' '}
                  ofrece una vista panorámica de la ciudad que combina{' '}
                  <strong className="text-white font-semibold">
                    coctelería de autor
                  </strong>
                  ,
                  <strong className="text-white font-semibold">
                    {' '}
                    DJs en vivo
                  </strong>{' '}
                  y un ambiente sin filtros, despojandonos de las poses.
                </p>

                <p className="text-xl text-gray-200 font-source-sans leading-relaxed">
                  Creemos que la noche es un lienzo. Por eso diseñamos una
                  experiencia nocturna que eleva los sentidos:
                  <strong className="text-white font-semibold">
                    {' '}
                    tragos originales
                  </strong>{' '}
                  creados por bartenders locales, música que va del house al
                  indie-electrónico, y la brisa atlántica completando la escena.
                </p>
              </motion.div>

              <motion.div
                className="flex items-center justify-center text-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <p className="text-orange-300 font-legquinne ">
                  "Eleven Club eleva la experiencia nocturna y baja el filtro"
                  <span className="text-orange-200 text-lg ml-4">✦</span>
                </p>
              </motion.div>
            </div>

            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <Image
                  src="/detalle-texto-eleven.webp"
                  alt="Eleven Club detalle"
                  width={400}
                  height={300}
                  className="relative shadow-4xl border-none justify-center items-center w-full"
                  quality={100}
                />
              </div>

              <motion.div
                className="absolute -bottom-6 -right-6 w-24 h-24flex items-center justify-center shadow-2xl"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <span className="text-orange-200 text-2xl font-legquinne">
                  11
                </span>
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
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <h2 className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6">
              Nuestra experiencia
            </h2>

            <motion.div
              className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Tragos de Autor */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-8 h-full">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  {/* SVG de copa premium con predominancia naranja y detalles amarillos */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    {/* Definición de degradados naranjas y detalles negros */}
                    <defs>
                      <linearGradient
                        id="naranja-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#FF9100" />{' '}
                        {/* Naranja intenso */}
                        <stop offset="100%" stopColor="#FF6D00" />{' '}
                        {/* Naranja oscuro */}
                      </linearGradient>
                      <radialGradient
                        id="amarillo-shine"
                        cx="0.7"
                        cy="0.2"
                        r="0.7"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FFFDE7"
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor="#FFD600"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <linearGradient
                        id="tallo-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#FFD600" />
                        <stop offset="100%" stopColor="#FF9100" />
                      </linearGradient>
                    </defs>
                    {/* Copa con degradado naranja y borde negro */}
                    <path
                      d="M12 6 Q24 10 36 6 Q34 24 24 32 Q14 24 12 6 Z"
                      fill="url(#naranja-gradient)"
                      stroke="#111"
                      strokeWidth="2.2"
                    />
                    {/* Brillo superior amarillo */}
                    <ellipse
                      cx="24"
                      cy="10"
                      rx="10"
                      ry="2"
                      fill="url(#amarillo-shine)"
                      opacity="0.8"
                    />
                    {/* Tallo con degradado amarillo-naranja y borde negro */}
                    <rect
                      x="22"
                      y="32"
                      width="4"
                      height="10"
                      rx="2"
                      fill="url(#tallo-gradient)"
                      stroke="#111"
                      strokeWidth="1.2"
                    />
                    {/* Base con degradado naranja y borde negro */}
                    <ellipse
                      cx="24"
                      cy="44"
                      rx="8"
                      ry="2.5"
                      fill="url(#naranja-gradient)"
                      stroke="#111"
                      strokeWidth="1.2"
                    />
                    {/* Detalles de burbujas en naranja y negro */}
                    <circle
                      cx="24"
                      cy="18"
                      r="1.2"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.5"
                      opacity="0.85"
                    />
                    <circle
                      cx="21"
                      cy="15"
                      r="0.7"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.4"
                      opacity="0.7"
                    />
                    <circle
                      cx="27"
                      cy="16"
                      r="0.9"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.4"
                      opacity="0.7"
                    />
                    {/* Sombrita debajo del cóctel */}
                    <ellipse
                      cx="24"
                      cy="47"
                      rx="9"
                      ry="2.2"
                      fill="#111"
                      opacity="0.18"
                    />
                    {/* Reflejo lateral en naranja claro con borde negro */}
                    <path
                      d="M30 12 Q32 18 26 24"
                      stroke="#FFD600"
                      strokeWidth="1"
                      opacity="0.5"
                      fill="none"
                    />
                    {/* Detalle extra: destello naranja en el borde con borde negro */}
                    <circle
                      cx="36"
                      cy="8"
                      r="0.8"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.3"
                      opacity="0.95"
                    />
                    {/* Detalle negro extra: línea de sombra interna */}
                    <path
                      d="M16 8 Q24 14 32 8"
                      stroke="#111"
                      strokeWidth="0.7"
                      opacity="0.4"
                      fill="none"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold font-legquinne text-white mb-4 text-center">
                  Tragos de Autor
                </h3>
                <p className="text-gray-200  text-center leading-relaxed">
                  Cócteles únicos creados por nuestros bartenders expertos,
                  combinando técnicas tradicionales con los ingredientes más
                  nobles e innovadores.
                </p>
              </div>
            </motion.div>

            {/* DJs en Vivo */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative bg-gradient-to-br from-black/70 to-black/40 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 h-full">
                <div className="w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300 ">
                  {/* Icono de controlador DJ versión naranja Eleven, ahora con más naranja y detalles negros */}
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    {/* Definición de degradado naranja para la sombra */}
                    <defs>
                      <radialGradient
                        id="dj-shadow-gradient-eleven"
                        cx="50%"
                        cy="50%"
                        r="50%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FF9100"
                          stopOpacity="0.7"
                        />
                        <stop
                          offset="100%"
                          stopColor="#FF9100"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <linearGradient
                        id="naranja-dark"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#FF9100" />
                        <stop offset="100%" stopColor="#FF6D00" />
                      </linearGradient>
                    </defs>
                    {/* Base de la consola en naranja degradado con borde negro */}
                    <rect
                      x="10"
                      y="20"
                      width="60"
                      height="32"
                      rx="8"
                      fill="url(#naranja-dark)"
                      stroke="#111"
                      strokeWidth="2.5"
                    />
                    {/* Plato izquierdo en naranja fuerte con borde negro */}
                    <circle
                      cx="26"
                      cy="36"
                      r="8"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="2"
                    />
                    <circle
                      cx="26"
                      cy="36"
                      r="3"
                      fill="#FF6D00"
                      opacity="0.9"
                      stroke="#111"
                      strokeWidth="0.7"
                    />
                    {/* Plato derecho en naranja fuerte con borde negro */}
                    <circle
                      cx="54"
                      cy="36"
                      r="8"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="2"
                    />
                    <circle
                      cx="54"
                      cy="36"
                      r="3"
                      fill="#FF6D00"
                      opacity="0.9"
                      stroke="#111"
                      strokeWidth="0.7"
                    />
                    {/* Fader central en naranja con borde negro */}
                    <rect
                      x="36"
                      y="44"
                      width="8"
                      height="2.5"
                      rx="1"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.8"
                    />
                    {/* Botones superiores en tonos naranja y negro */}
                    <circle
                      cx="20"
                      cy="26"
                      r="1.7"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r="1.7"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="32"
                      cy="26"
                      r="1.7"
                      fill="#111"
                      stroke="#FF9100"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="48"
                      cy="26"
                      r="1.7"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="54"
                      cy="26"
                      r="1.7"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="60"
                      cy="26"
                      r="1.7"
                      fill="#111"
                      stroke="#FFD600"
                      strokeWidth="0.5"
                    />
                    {/* Botones inferiores en tonos naranja y negro */}
                    <circle
                      cx="20"
                      cy="48"
                      r="1.4"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="26"
                      cy="48"
                      r="1.4"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="32"
                      cy="48"
                      r="1.4"
                      fill="#111"
                      stroke="#FFD600"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="1.4"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="54"
                      cy="48"
                      r="1.4"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="60"
                      cy="48"
                      r="1.4"
                      fill="#111"
                      stroke="#FFD600"
                      strokeWidth="0.4"
                    />
                    {/* Detalles de sliders verticales en naranja y negro */}
                    <rect
                      x="38"
                      y="30"
                      width="1.7"
                      height="8"
                      rx="0.7"
                      fill="#FFD600"
                      stroke="#111"
                      strokeWidth="0.5"
                      opacity="0.85"
                    />
                    <rect
                      x="40.5"
                      y="30"
                      width="1.7"
                      height="8"
                      rx="0.7"
                      fill="#FF9100"
                      stroke="#111"
                      strokeWidth="0.5"
                      opacity="0.7"
                    />
                    {/* Luces decorativas en naranja Eleven */}
                    <ellipse
                      cx="40"
                      cy="54"
                      rx="18"
                      ry="2.5"
                      fill="url(#dj-shadow-gradient-eleven)"
                      opacity="0.7"
                    />
                    {/* Detalles extra: líneas y perillas en negro para más contraste */}
                    {/* Línea horizontal central */}
                    <rect
                      x="10"
                      y="36"
                      width="60"
                      height="1.2"
                      fill="#111"
                      opacity="0.5"
                    />
                    {/* Perillas pequeñas en negro arriba */}
                    <circle cx="16" cy="22" r="0.9" fill="#111" />
                    <circle cx="64" cy="22" r="0.9" fill="#111" />
                    {/* Perillas pequeñas en negro abajo */}
                    <circle cx="16" cy="52" r="0.9" fill="#111" />
                    <circle cx="64" cy="52" r="0.9" fill="#111" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold font-legquinne text-white mb-4 text-center">
                  DJs en Vivo
                </h3>
                <p className="text-gray-200 text-center leading-relaxed">
                  Sets exclusivos de DJs que fusionan house, indie y
                  electrónica, generando el ambiente ideal para disfrutar la
                  noche Eleven.
                </p>
              </div>
            </motion.div>

            {/* Vista Panorámica */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="relative bg-gradient-to-br from-black/70 to-black/40 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 h-full">
                <div className="w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300 ">
                  {/* Icono de edificio de 11 pisos con detalles naranjas y negros */}
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    {/* Sombra del edificio */}
                    <ellipse
                      cx="32"
                      cy="58"
                      rx="18"
                      ry="3"
                      fill="#FF9100"
                      opacity="0.15"
                    />
                    {/* Base del edificio */}
                    <rect
                      x="18"
                      y="14"
                      width="28"
                      height="38"
                      rx="3"
                      fill="#111"
                      stroke="#FF9100"
                      strokeWidth="2"
                    />
                    {/* Pisos (11 líneas horizontales para simular los pisos) */}
                    {[...Array(10)].map((_, i) => (
                      <rect
                        key={i}
                        x="18"
                        y={17.5 + i * 3.5}
                        width="28"
                        height="1"
                        fill="#FF9100"
                        opacity="0.5"
                      />
                    ))}
                    {/* Ventanas: 3 por piso, 11 pisos */}
                    {[...Array(11)].map((_, piso) =>
                      [0, 1, 2].map((col) => (
                        <rect
                          key={`ventana-${piso}-${col}`}
                          x={21 + col * 8}
                          y={16 + piso * 3.5}
                          width="4"
                          height="2"
                          rx="0.7"
                          fill="#FF9100"
                          opacity={0.7 + 0.2 * (piso % 2 ? 1 : 0)}
                        />
                      ))
                    )}
                    {/* Terraza */}
                    <rect
                      x="16"
                      y="10"
                      width="32"
                      height="6"
                      rx="2"
                      fill="#FF6D00"
                      stroke="#111"
                      strokeWidth="1.5"
                    />
                    {/* Baranda de la terraza */}
                    <rect
                      x="20"
                      y="7"
                      width="24"
                      height="2.5"
                      rx="1"
                      fill="#111"
                    />
                    {/* Detalles de luces naranjas en la terraza */}
                    <circle cx="24" cy="8.5" r="0.8" fill="#FF9100" />
                    <circle cx="32" cy="8.5" r="0.8" fill="#FF9100" />
                    <circle cx="40" cy="8.5" r="0.8" fill="#FF9100" />
                    {/* Detalle: una sombrilla negra con detalles naranjas en la terraza */}
                    <ellipse
                      cx="44"
                      cy="12"
                      rx="3"
                      ry="1"
                      fill="#111"
                      stroke="#FF9100"
                      strokeWidth="0.7"
                    />
                    <rect
                      x="43.2"
                      y="12"
                      width="1.6"
                      height="4"
                      rx="0.5"
                      fill="#FF9100"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold font-legquinne mt-2 text-white mb-4 text-center">
                  Vista Panorámica
                </h3>
                <p className="text-gray-200 text-center leading-relaxed">
                  Ubicados en el piso 11, disfrutá de la mejor vista panorámica
                  de la ciudad mientras la brisa atlántica completa tu
                  experiencia.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ubicación y Horarios */}
      <section className="py-20 px-4 bg-black font-source-sans">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <h2 className="font-legquinne text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6">
              Ubicación y Horarios
            </h2>

            <motion.div
              className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row gap-12 "
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Info de ubicación y horarios */}
            <div className="w-full md:w-1/2 flex flex-col gap-8 ">
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg text-white text-left w-full font-semibold mb-1 tracking-wide">
                  Horarios de Funcionamiento:
                </p>
                <p className="text-orange-200 text-base text-left w-full">
                  <span className="font-bold">Lunes a Domingo:</span> 20:00 -
                  02:30
                  <br />
                  <span className="font-bold">Eventos Especiales:</span>{' '}
                  Consultar programación
                </p>
                <p className="text-gray-300 text-base mt-2">
                  Abiertos todo el año con eventos especiales y sesiones de DJ
                  que mantienen la vibra alta.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-lg text-white text-left w-full font-semibold mb-1 tracking-wide">
                  Ubicación:
                </p>
                <p className="text-lg text-orange-200 tracking-wide text-left w-full">
                  Diagonal Pueyrredón 2970
                  <br />
                  Mar del Plata, Buenos Aires
                </p>
                <p className="text-gray-300 text-base mt-2 text-left w-full">
                  En el corazón de Mar del Plata, con la mejor vista panorámica
                  a la ciudad desde el piso 11.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg border border-orange-500/30 relative">
            <iframe
              title="Mapa Eleven Club"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.857964024052!2d-57.54212368477044!3d-38.0123459797167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584de9e2e2e2e2e%3A0x1234567890abcdef!2sDiagonal%20Pueyrred%C3%B3n%202970%2C%20Mar%20del%20Plata%2C%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1710000000000!5m2!1ses-419!2sar"
              width="100%"
              height="350"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="font-source-sans py-20 px-4 bg-gradient-to-b from-black to-orange-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="font-source-sans text-3xl md:text-4xl font-normal text-white mb-6">
              Sumate a Nuestra Comunidad
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Descubrí por qué Eleven Club es el rooftop de referencia en Mar
              del Plata. Reservá tu experiencia única y elevá tus sentidos.
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
