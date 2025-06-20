"use client"

import Image from "next/image"
import ReservationForm from "@/components/reservation-form"
import LiveCounter from "@/components/live-counter"
import ReservationCalendar from "@/components/reservation-calendar"

export default function HomePage() {


  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Bar atmosphere"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NOCTURNOS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light leading-relaxed">
            Viví la experiencia que arranca como cena...
            <br />
            <span className="text-purple-300 font-medium">y termina como fiesta</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="px-6 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">🍽️ Cena desde las 19:00</span>
            </div>
            <div className="px-6 py-2 bg-pink-600/20 rounded-full border border-pink-500/30">
              <span className="text-pink-300 text-sm font-medium">🎉 Boliche desde las 23:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Reservá tu Experiencia</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              No te quedes afuera de la mejor noche de la ciudad. Asegurate tu lugar y viví una experiencia única.
            </p>
          </div>

          <LiveCounter />

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <ReservationForm />
            </div>

            <div className="space-y-8">
              <ReservationCalendar isAdmin={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Nocturnos. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-sm mt-2">Experiencia gastronómica y nocturna de primer nivel</p>
        </div>
      </footer>
    </div>
  )
}
