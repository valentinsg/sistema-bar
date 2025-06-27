"use client"

import LiveCounter from "@/components/live-counter-sse"
import ReservationCalendar from "@/components/reservation-calendar"
import ReservationForm from "@/components/reservation-form"
import { motion } from "framer-motion"
import Image from "next/image"

export default function HomePage() {


  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-start justify-center overflow-hidden pt-16 md:pt-20 lg:pt-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/FONDOS-01.webp"
            alt="Eleven Club atmosphere"
            fill
            className="object-cover smooth-rendering gpu-accelerated"
            priority
            quality={95}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 gradient-quality"></div>
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center"
          >
            <Image
              src="/logo-eleven.webp"
              alt="Eleven Club"
              width={150}
              height={150}
              className="mx-auto logo-quality gpu-accelerated sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px]"
              quality={100}
              priority
            />
          </motion.div>

          {/* Main Title with integrated aureola */}
          <motion.div
            className="relative mb-8 mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <h1 className="font-legquinne text-5xl md:text-8xl lg:text-9xl font-normal text-white tracking-wide leading-tighter text-crisp gpu-accelerated">
              <span className="relative inline-block">
                E
                {/* Aureola alargada horizontalmente con recorrido completo - MEJORADA */}
                <div className="absolute -top-1 md:-top-2 lg:-top-3 -left-5 md:-left-8 lg:-left-12 w-16 md:w-24 lg:w-32 h-3 md:h-4 lg:h-5 gpu-accelerated">
                  {/* Óvalo principal estático - más largo que alto con mejor calidad */}
                  <div className="absolute inset-0 border-2 md:border-3 lg:border-4 border-white/80 transform -rotate-12 opacity-90 gpu-accelerated"
                    style={{
                      borderRadius: "50%",
                      background: "transparent",
                      width: "100%",
                      height: "100%",
                      top: "0%",
                      transform: "rotate(-12deg)",
                      boxShadow: "0 0 8px rgba(255,255,255,0.4), 0 0 16px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
                    }}></div>

                  {/* Estrella que bordea exactamente el óvalo - MEJORADA */}
                  <div className="absolute inset-0 gpu-accelerated" style={{ transform: "rotate(-12deg)" }}>
                    <div
                      className="absolute text-white text-xs md:text-sm lg:text-base lg:hidden"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))",
                        animation: "elliptical-orbit-ultrafluid 8s linear infinite"
                      }}
                    >
                      ✦
                    </div>
                    <div
                      className="absolute text-white text-base hidden lg:block"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))",
                        animation: "elliptical-orbit-ultrafluid-lg 8s linear infinite"
                      }}
                    >
                      ✦
                    </div>
                  </div>

                  {/* Segunda estrella imperceptible pero mejorada */}
                  <div className="absolute inset-0 gpu-accelerated" style={{ transform: "rotate(-20deg)" }}>
                    <div
                      className="absolute text-white/20 text-[6px] md:text-[8px] lg:hidden"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "drop-shadow(0 0 2px rgba(255,255,255,0.3))",
                        animation: "elliptical-orbit-reverse 12s linear infinite"
                      }}
                    >
                      ·
                    </div>
                    <div
                      className="absolute text-white/20 text-[10px] hidden lg:block"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "drop-shadow(0 0 2px rgba(255,255,255,0.3))",
                        animation: "elliptical-orbit-reverse-lg 12s linear infinite"
                      }}
                    >
                      ·
                    </div>
                  </div>

                  {/* Brillo interno muy sutil - MEJORADO */}
                  <motion.div
                    className="absolute bg-gradient-to-br from-white/8 via-transparent to-white/4 transform -rotate-20 gpu-accelerated"
                    style={{
                      borderRadius: "50%",
                      width: "90%",
                      height: "80%",
                      top: "10%",
                      left: "5%",
                      filter: "blur(0.5px)"
                    }}
                    animate={{
                      opacity: [0.05, 0.25, 0.05]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </span>
              leva tus sentidos
            </h1>
          </motion.div>

          {/* Subtitle with decorative element */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <button
              onClick={() => {
                const reservationSection = document.getElementById('reservation-section')
                if (reservationSection) {
                  reservationSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  })
                }
              }}
              className="group relative inline-flex items-center gap-3 px-6 py-3 border border-white/30 rounded-full text-2xl md:text-4xl lg:text-5xl text-white/95 font-light font-source-sans tracking-wider text-crisp hover:border-white/50 hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <span>Reserva tu Experiencia</span>
              <motion.div
                className="text-white/70 group-hover:text-white/90 transition-colors duration-300"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.div>
            </button>
          </motion.div>

          {/* Action Buttons - Mejorados con efectos premium */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          >
            <LiveCounter />
          </motion.div>
        </motion.div>
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-5"></div>
      </section>

      {/* Reservation Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-source-sans text-4xl md:text-5xl font-normal text-white mb-4">Reservá tu Experiencia</h2>
            <p className="text-xl font-source-sans text-gray-300 max-w-2xl mx-auto">
              No te quedes afuera de la mejor noche de la ciudad. Asegurate tu lugar y viví una experiencia única en Eleven Club.
            </p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-start"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <ReservationForm />
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ReservationCalendar isAdmin={false} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Eleven Club. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-sm mt-2">Experiencia gastronómica y nocturna de primer nivel</p>
        </div>
      </footer>
    </div>
  )
}
