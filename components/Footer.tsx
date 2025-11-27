import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br font-legquinne from-gray-950 via-orange-1000 to-orange-950 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Logo y branding */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/eleven_club_logo.webp"
            alt="Eleven Club"
            width={120}
            height={120}
            className="mb-4"
          />
          <p className="text-orange-400 font-source-sans text-lg font-light">
            Elevá tus sentidos
          </p>
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Contacto */}
          <div>
            <h3 className="font-bold font-legquinne text-xl mb-4 text-white">Contacto</h3>
            <div className="space-y-3 text-base text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-source-sans">Diagonal Pueyrredón 2970, Mar del Plata</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-source-sans">20:00 - 02:30</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-source-sans">2236859717</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="font-bold font-legquinne text-xl mb-4 text-white">Navegación</h3>
            <div className="space-y-3 text-base">
              <a
                href="/"
                className="block font-source-sans text-gray-300 hover:text-orange-400 transition-colors"
              >
                Inicio
              </a>
              <a
                href="/sobre"
                className="block font-source-sans text-gray-300 hover:text-orange-400 transition-colors"
              >
                Sobre Nosotros
              </a>
              <a
                href="/cartamdp"
                className="block font-source-sans text-gray-300 hover:text-orange-400 transition-colors"
              >
                Carta
              </a>
              <a
                href="/faqs"
                className="block font-source-sans text-gray-300 hover:text-orange-400 transition-colors"
              >
                FAQs
              </a>
            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="font-bold text-xl mb-4 text-white">Seguinos</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/elevenclubok"
                aria-label="Instagram"
                className="p-2 rounded-lg border border-gray-600 hover:border-orange-400 hover:bg-orange-400/10 transition-colors"
              >
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </a>
            </div>
          </div>
        </div>

      {/* Partners */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6 text-left text-white">
            Partners
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              <Image
                src="/campari_logo.png"
                alt="Campari"
                width={150}
                height={150}
                className="relative z-10 w-24 h-24 md:w-36 md:h-36 object-contain group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 drop-shadow-xl group-hover:drop-shadow-2xl group-hover:brightness-110"
                loading="lazy"
              />
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              <Image
                src="/bulldog_logo.png"
                alt="Bulldog"
                width={150}
                height={150}
                className="relative z-10 w-24 h-24 md:w-36 md:h-36 object-contain group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 drop-shadow-xl group-hover:drop-shadow-2xl group-hover:brightness-110"
                loading="lazy"
              />
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              <Image
                src="/Chivas Logo Negro.png"
                alt="Chivas"
                width={150}
                height={150}
                className="relative z-10  w-24 h-24 md:w-36 md:h-36 object-contain group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 drop-shadow-xl group-hover:drop-shadow-2xl group-hover:brightness-110"
                loading="lazy"
              />
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              <Image
                src="/budweiser.png"
                alt="Budweiser"
                width={150}
                height={150}
                className="relative z-10 w-24 h-24 md:w-36 md:h-36 object-contain group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 drop-shadow-xl group-hover:drop-shadow-2xl group-hover:brightness-110"
                loading="lazy"

              />
            </div>
          </div>
        </div>

        {/* Footer base */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-400 font-source-sans">
            © 2024 Eleven Club — Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
