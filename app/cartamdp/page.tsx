'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function CartaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    closeMenu()
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-montserrat p-5">
      {/* H1 oculto para SEO */}
      <h1 className="sr-only">
        Carta de Tragos y Bebidas - Eleven Club | Rooftop Bar Mar del Plata
      </h1>

      {/* Menú overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-96 flex flex-col items-center justify-center z-40">
          <ul className="list-none p-0 m-0 text-center">
            <li className="my-4">
              <button
                onClick={() => scrollToSection('firma')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Cocktails de firma
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('eternos')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Eternos
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('vermut')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Aperitivos y Vermut
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('spritz')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Spritz Season
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('negronis')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Negronis de la Casa
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('whisky')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Whiskies
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('gin')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Gin
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('ron')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Ron
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('botellas')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Botellas
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('champagne')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Champagne / Espumantes
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('cervezas')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Cervezas
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('vinos')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Vinos
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('mocktails')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Mocktails
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('refrescos')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Aguas y Refrescos
              </button>
            </li>
            <li className="my-4">
              <button
                onClick={() => scrollToSection('delicateses')}
                className="text-white text-xl font-oswald hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Delicias selectas
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Header */}
      <header className="text-center py-8 px-3">
        <Image
          src="/logo-eleven.webp"
          alt="Eleven Club - Logo del rooftop bar de Mar del Plata"
          width={200}
          height={70}
          className="mx-auto mb-5 max-h-[70px] w-auto"
        />
        <p className="text-lg max-w-4xl mx-auto text-gray-300 leading-relaxed mb-6">
          En un viaje hacia el origen, descubrimos una profunda conexión con
          nuestro ser interior, donde la creatividad fluye libremente alimentada
          por la confianza en lo que somos y en lo que podemos llegar a ser.
          Esta experiencia, un tanto mística e intensa, nos deja una sensación
          reconfortante de libertad y pensamiento guiada por una voz sabia que
          habita en los más profundo de nuestro interior. Así damos comienzo a
          un nuevo ciclo de disfrute, inspirados por nuevos estados de
          innovación transformando lo vivido en auténtico y real.
        </p>
        <h2 className="text-3xl font-oswald font-bold mb-2 text-white text-center mt-16">
          - CARTA -<br />
          <span className="text-lg">ft Juan Roda</span>
        </h2>
        <p className="italic text-gray-300">
          <em>Comenzamos con un Cocktail y no sabemos con cuál terminar</em>
        </p>
      </header>

      <div className="max-w-4xl mx-auto pb-10">
        <h3
          id="firma"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Cocktails de firma
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">GENESIS</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Vermut Tempestad, Tequila José Cuervo, Don mix, azahar
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">PANDEMONIO</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Gin Bulldog, almíbar, Albúmina, limón, wasabi
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">ELIXIR</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Chivas 12 años, miel, jengibre, pomelo
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">DULCE PESADILLA</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Ron Havana Club añejo, Frangelico, arándanos, lima, cacao, Franui
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">DELIRIO ESCOCÉS</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Johnnie Walker Black, frambuesas, hibisco, bitter de cacao y nuez
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">REISHI MARTINI</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Gin Bulldog, Reishi, oliva Zuelo Novello, limón
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">GIPSY HAVANA</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Havana Club mix, frutos rojos, hongo Shiitake y ají, limón, pomelo
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">VIEJO Y ELEGANTE</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Wild Turkey, azúcar de avellanas, bitter angostura, bitter de coco
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">SENCHA</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Vodka Absolut, tremella, limón, sencha, hibiscus
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">ABRAXAS</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Ron Havana Mix, orgeat, lima, limón, Vermut
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">ONCE</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Gin Bulldog, Pelargonium, limón, Aperol, jengibre, pomelo
        </div>

        <h3
          id="eternos"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Eternos
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">NEGRONI</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">GIN TONIC (Bulldog)</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">OLD FASHIONED</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">MARTINI</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">MANHATTAN</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">TOM COLLINS</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">GIMLET</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">BLOODY MARY</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">DAIQUIRI COCKTAIL</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">MINT JULEP</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>

        <h3
          id="delicateses"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Delicias selectas
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">
            Verduras marinadas con pan orgánico
          </span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Berenjenas asadas, tomates y verduras marinadas alineados con oliva
          extra virgen, pesto y pan
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">
            Jamón serrano <br />
            con pan orgánico y Stracciatella
          </span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Tostón con stracciatella, láminas de jamón de 14 meses y brotes de
          rúcula salvaje
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">
            Ración de quesos blandos y duros
          </span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Cortes de quesos artesanales acompañados de rodaja de pan
        </div>

        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">Papas Gauchescas</span>
          <span className="flex-none text-right min-w-[80px]">$8.000</span>
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Papas Gauchitas, láminas de jamón serrano y escamas de charqui del
          Noroeste Argentino y mayonesa ahumada
        </div>

        <h3
          id="vermut"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Aperitivos y Vermut
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Mi-To</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Americano</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Campari tonic</span>
          <span className="flex-none text-right min-w-[80px]">$8.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Cynar 70</span>
          <span className="flex-none text-right min-w-[80px]">$8.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Cinzano Rosso</span>
          <span className="flex-none text-right min-w-[80px]">$8.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Vermut Tempestad</span>
          <span className="flex-none text-right min-w-[80px]">$9.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">
            Vermut Tempestad de Bardo lata
          </span>
          <span className="flex-none text-right min-w-[80px]">$8.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Amaro Averna</span>
          <span className="flex-none text-right min-w-[80px]">$7.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jägermeister</span>
          <span className="flex-none text-right min-w-[80px]">$7.000</span>
        </div>

        <h3
          id="spritz"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Spritz Season
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Aperol Spritz</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Campari Spritz</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Cynar Spritz</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>

        <h3
          id="negronis"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Negronis de la Casa
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Negroni Costero</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">
            Negroni Soleria Blanco licoroso
          </span>
          <span className="flex-none text-right min-w-[80px]">$20.000</span>
        </div>

        <h3
          id="whisky"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Whisky Escocés
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas Regal 12 años</span>
          <span className="flex-none text-right min-w-[80px]">$14.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas XV Gold</span>
          <span className="flex-none text-right min-w-[80px]">$18.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas Regal 18 años</span>
          <span className="flex-none text-right min-w-[80px]">$26.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas Mizunara</span>
          <span className="flex-none text-right min-w-[80px]">$21.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas Ultis Blended malt</span>
          <span className="flex-none text-right min-w-[80px]">$95.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Royal Salute 21 years</span>
          <span className="flex-none text-right min-w-[80px]">$80.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">The Deacon</span>
          <span className="flex-none text-right min-w-[80px]">$28.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W Black label</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W Doble Black</span>
          <span className="flex-none text-right min-w-[80px]">$20.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W Gold Reserve</span>
          <span className="flex-none text-right min-w-[80px]">$25.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W Green label</span>
          <span className="flex-none text-right min-w-[80px]">$45.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W 18 years label</span>
          <span className="flex-none text-right min-w-[80px]">$42.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Johnnie W Blue label</span>
          <span className="flex-none text-right min-w-[80px]">$70.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Glenmorangie Single Malt</span>
          <span className="flex-none text-right min-w-[80px]">$40.000</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          Whisky Irlandés
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jameson</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Tullamore</span>
          <span className="flex-none text-right min-w-[80px]">$20.000</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          American Whisky - Kentucky
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Wild Turkey</span>
          <span className="flex-none text-right min-w-[80px]">$14.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Wild Turkey 101</span>
          <span className="flex-none text-right min-w-[80px]">$20.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Maker's Mark</span>
          <span className="flex-none text-right min-w-[80px]">$26.000</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          Tennessee
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jack Daniel's</span>
          <span className="flex-none text-right min-w-[80px]">$17.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jack Daniel's Gentleman Jack</span>
          <span className="flex-none text-right min-w-[80px]">$25.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jack Daniel's Single Barrel</span>
          <span className="flex-none text-right min-w-[80px]">$30.000</span>
        </div>

        <h3
          id="gin"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Gin
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Bulldog</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Bombay</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Citadelle</span>
          <span className="flex-none text-right min-w-[80px]">$17.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Monkey 47</span>
          <span className="flex-none text-right min-w-[80px]">$26.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Martín Miller's</span>
          <span className="flex-none text-right min-w-[80px]">$18.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Hendricks</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Hendricks Flora Adora</span>
          <span className="flex-none text-right min-w-[80px]">$17.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Malfy</span>
          <span className="flex-none text-right min-w-[80px]">$16.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Malfy limone</span>
          <span className="flex-none text-right min-w-[80px]">$17.000</span>
        </div>

        <h3
          id="ron"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Ron
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Havana club 3 años</span>
          <span className="flex-none text-right min-w-[80px]">$10.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Havana club Añejo</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Havana club 7 años</span>
          <span className="flex-none text-right min-w-[80px]">$15.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">
            Havana club selección de Maestros
          </span>
          <span className="flex-none text-right min-w-[80px]">$28.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Appleton State Reserve 8</span>
          <span className="flex-none text-right min-w-[80px]">$20.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Plantatium Original Dark</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Flor de caña slow 4 aged</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>

        <h3
          id="botellas"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Servicio de botella (desde las 23 hs)
        </h3>
        <div className="text-sm text-gray-400 mb-3">
          Incluye cítricos, botánico y hielo Prisma
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Gin Bulldog</span>
          <span className="flex-none text-right min-w-[80px]">$100.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Vodka Absolut</span>
          <span className="flex-none text-right min-w-[80px]">$110.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chivas XV Gold</span>
          <span className="flex-none text-right min-w-[80px]">$210.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Royal Salute 21</span>
          <span className="flex-none text-right min-w-[80px]">$500.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Negroni Vendaval</span>
          <span className="flex-none text-right min-w-[80px]">$60.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Jägermeister + 2 Red Bull</span>
          <span className="flex-none text-right min-w-[80px]">$120.000</span>
        </div>

        <h3
          id="champagne"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Champagne
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Veuve Clicquot Brut</span>
          <span className="flex-none text-right min-w-[80px]">$290.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Moët & Chandon</span>
          <span className="flex-none text-right min-w-[80px]">$250.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Dom Pérignon</span>
          <span className="flex-none text-right min-w-[80px]">$888.000</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          Espumantes
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chandon Extra Brut</span>
          <span className="flex-none text-right min-w-[80px]">$60.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chandon Rosé</span>
          <span className="flex-none text-right min-w-[80px]">$60.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Chandon Délice Rosé</span>
          <span className="flex-none text-right min-w-[80px]">$60.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Baron B Extra Brut</span>
          <span className="flex-none text-right min-w-[80px]">$100.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Baron B Rosé</span>
          <span className="flex-none text-right min-w-[80px]">$110.000</span>
        </div>

        <h3
          id="cervezas"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Cervezas
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Budweiser</span>
          <span className="flex-none text-right min-w-[80px]">$5.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Corona</span>
          <span className="flex-none text-right min-w-[80px]">$5.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Stella Artois</span>
          <span className="flex-none text-right min-w-[80px]">$5.000</span>
        </div>

        <h3
          id="vinos"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Vinos
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Ereditá Chardonnay</span>
          <span className="flex-none text-right min-w-[80px]">$25.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Pulenta Rosado</span>
          <span className="flex-none text-right min-w-[80px]">$28.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">
            Gran Corte Piccolo Banfi Blend
          </span>
          <span className="flex-none text-right min-w-[80px]">$27.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Zuccardi Q Malbec</span>
          <span className="flex-none text-right min-w-[80px]">$31.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left text-sm">
            Fumata Bianca Sauvignon Blanc PB
          </span>
          <span className="flex-none text-right min-w-[80px]">$40.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Polígonos Malbec</span>
          <span className="flex-none text-right min-w-[80px]">$44.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Polígonos Verdejo</span>
          <span className="flex-none text-right min-w-[80px]">$44.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Polígonos Cabernet Franc</span>
          <span className="flex-none text-right min-w-[80px]">$44.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Memorias de Ida Malbec</span>
          <span className="flex-none text-right min-w-[80px]">$90.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Aluvional Gualtallary</span>
          <span className="flex-none text-right min-w-[80px]">$135.000</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Piedra Infinita</span>
          <span className="flex-none text-right min-w-[80px]">$250.000</span>
        </div>

        <h3
          id="mocktails"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Mocktails
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Cocktail sin alcohol</span>
          <span className="flex-none text-right min-w-[80px]">$12.000</span>
        </div>

        <h3
          id="refrescos"
          className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1"
        >
          Aguas Nacionales
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Eco sin gas</span>
          <span className="flex-none text-right min-w-[80px]">$3.500</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Eco con gas</span>
          <span className="flex-none text-right min-w-[80px]">$3.500</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          Aguas Importadas
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Perrier</span>
          <span className="flex-none text-right min-w-[80px]">$7.000</span>
        </div>

        <h3 className="font-oswald text-xl mt-10 mb-3 border-b border-gray-600 pb-1">
          Refrescos
        </h3>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Pepsi</span>
          <span className="flex-none text-right min-w-[80px]">$3.500</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">7up</span>
          <span className="flex-none text-right min-w-[80px]">$3.500</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Agua tónica Schweppes</span>
          <span className="flex-none text-right min-w-[80px]">$3.500</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Agua tónica Britvic</span>
          <span className="flex-none text-right min-w-[80px]">$4.500</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dotted border-gray-700 flex-wrap">
          <span className="flex-1 text-left">Red Bull</span>
          <span className="flex-none text-right min-w-[80px]">$9.500</span>
        </div>
      </div>
    </div>
  )
}
