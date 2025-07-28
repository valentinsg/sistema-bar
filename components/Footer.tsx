import Image from "next/image"

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 font-source-sans py-16 px-6 text-white overflow-hidden">
      {/* Efectos de fondo atmosféricos */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>

      {/* Efectos de luz sutil */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>

      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Branding centrado elegante */}
        <div className="flex flex-col items-center gap-6 mb-16">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-xl opacity-60"></div>
            <Image
              src="/eleven_club_logo.webp"
              alt="Eleven Club"
              width={80}
              height={80}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-legquinne text-white mb-3 tracking-wide">Eleven Club</h2>
            <p className="text-orange-300/90 text-lg font-light tracking-wider">Eleva tus sentidos</p>
          </div>
        </div>

        {/* Línea decorativa central */}
        <div className="flex justify-center mb-12">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
        </div>

        {/* Información de contacto y navegación */}
        <div className="grid md:grid-cols-3 gap-16 mb-16">
          {/* Contacto */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-xl mb-8 text-white relative">
              <span className="relative z-10 tracking-wide">Contacto</span>
              <div className="absolute -bottom-2 left-0 w-16 h-px bg-gradient-to-r from-orange-500 to-transparent"></div>
            </h3>
            <div className="space-y-6 text-sm text-gray-300">
              <div className="flex items-center gap-4 group">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                <p className="group-hover:text-white transition-colors duration-300 tracking-wide">Diagonal Pueyrredón 2970, Mar del Plata</p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                <p className="group-hover:text-white transition-colors duration-300 tracking-wide">20:00 - 02:30</p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                <p className="group-hover:text-white transition-colors duration-300 tracking-wide">0223-5357224</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="text-center">
            <h3 className="font-semibold text-xl mb-8 text-white relative">
              <span className="relative z-10 tracking-wide">Navegación</span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-orange-500 to-transparent"></div>
            </h3>
            <div className="space-y-4 text-sm">
              <a href="/" className="block text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 tracking-wide">Inicio</a>
              <a href="/sobre" className="block text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 tracking-wide">Sobre Nosotros</a>
              <a href="/cartamdp" className="block text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 tracking-wide">Carta</a>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-xl mb-8 text-white relative">
              <span className="relative z-10 tracking-wide">Seguinos</span>
              <div className="absolute -bottom-2 right-0 w-16 h-px bg-gradient-to-l from-orange-500 to-transparent"></div>
            </h3>
            <a
              href="https://www.instagram.com/elevenclubok"
              aria-label="Instagram"
              className="inline-block p-4 rounded-full border border-white/20 hover:border-orange-500/50 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 transition-all duration-300 group"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-orange-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="relative z-10 w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </a>
          </div>
        </div>

        {/* Partners elegante */}
        <div className="text-center mb-16">
          <h3 className="font-semibold text-xl mb-10 text-white relative">
            <span className="relative z-10 tracking-wide">Partners</span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
          </h3>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="group">
              <Image
                src="/campari_logo.png"
                alt="Campari"
                width={120}
                height={120}
                className="opacity-70 drop-shadow-lg w-24 h-24 md:w-28 md:h-28 object-contain group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                loading="lazy"
                quality={85}
              />
            </div>
            <div className="group">
              <Image
                src="/bulldog_logo.png"
                alt="Bulldog"
                width={120}
                height={120}
                className="opacity-70 drop-shadow-lg w-24 h-24 md:w-28 md:h-28 object-contain group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                loading="lazy"
                quality={85}
              />
            </div>
            <div className="group">
              <Image
                src="/Chivas Logo Negro.png"
                alt="Chivas"
                width={120}
                height={120}
                className="opacity-70 drop-shadow-lg w-24 h-24 md:w-28 md:h-28 object-contain group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                loading="lazy"
                quality={85}
              />
            </div>
            <div className="group">
              <Image
                src="/budweiser.png"
                alt="Budweiser"
                width={120}
                height={120}
                className="opacity-70 drop-shadow-lg w-24 h-24 md:w-28 md:h-28 object-contain group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                loading="lazy"
                quality={85}
              />
            </div>
          </div>
        </div>

        {/* Footer base elegante */}
        <div className="relative border-t border-orange-500/20 pt-8 text-center">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
          <p className="text-sm text-white/70 font-light tracking-wider">
            © 2024 Eleven Club — Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
