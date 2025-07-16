'use client'

import Image from "next/image"
import { useState } from "react"

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
    <>
      <style jsx global>{`
        body {
          margin: 0;
          background-color: #000;
          color: #f5f5f5;
          font-family: 'Montserrat', sans-serif;
          padding: 20px;
        }
        .carta-header {
          text-align: center;
          padding: 30px 10px;
        }
        .carta-header img {
          max-height: 70px;
          margin-bottom: 20px;
        }
        .carta-header p {
          font-size: 1.1rem;
          max-width: 800px;
          margin: auto;
          color: #ccc;
          line-height: 1.6;
        }
        .carta-h2 {
          font-family: 'Oswald', sans-serif;
          font-size: 2rem;
          text-align: center;
          margin-top: 60px;
          margin-bottom: 10px;
        }
        .carta-h3 {
          font-family: 'Oswald', sans-serif;
          font-size: 1.3rem;
          margin-top: 40px;
          border-bottom: 1px solid #444;
          padding-bottom: 5px;
        }
        .carta-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 0.5px dotted #333;
          flex-wrap: wrap;
        }
        .carta-item span:first-child {
          flex: 1 1 auto;
          text-align: left;
        }
        .carta-item span:last-child {
          flex: 0 0 auto;
          text-align: right;
          min-width: 80px;
        }
        .carta-desc {
          font-size: 0.9rem;
          color: #aaa;
          margin-bottom: 10px;
        }
        .carta-section {
          max-width: 800px;
          margin: auto;
          padding-bottom: 40px;
        }

        .carta-hamburger {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 1.8rem;
          background: #111;
          color: #fff;
          border-radius: 5px;
          padding: 6px 10px;
          z-index: 1001;
          cursor: pointer;
        }

        .carta-overlay-menu {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.96);
          display: ${isMenuOpen ? 'flex' : 'none'};
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .carta-overlay-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: center;
        }

        .carta-overlay-menu li {
          margin: 16px 0;
        }

        .carta-overlay-menu button {
          color: #fff;
          font-size: 1.2rem;
          text-decoration: none;
          font-family: 'Oswald', sans-serif;
          transition: 0.3s;
          background: none;
          border: none;
          cursor: pointer;
        }

        .carta-overlay-menu button:hover {
          color: #ccc;
        }
      `}</style>

      <div className="carta-overlay-menu">
        <ul>
          <li><button onClick={() => scrollToSection('firma')}>Cocktails de firma</button></li>
          <li><button onClick={() => scrollToSection('eternos')}>Eternos</button></li>
          <li><button onClick={() => scrollToSection('vermut')}>Aperitivos y Vermut</button></li>
          <li><button onClick={() => scrollToSection('spritz')}>Spritz Season</button></li>
          <li><button onClick={() => scrollToSection('negronis')}>Negronis de la Casa</button></li>
          <li><button onClick={() => scrollToSection('whisky')}>Whiskies</button></li>
          <li><button onClick={() => scrollToSection('gin')}>Gin</button></li>
          <li><button onClick={() => scrollToSection('ron')}>Ron</button></li>
          <li><button onClick={() => scrollToSection('botellas')}>Botellas</button></li>
          <li><button onClick={() => scrollToSection('champagne')}>Champagne / Espumantes</button></li>
          <li><button onClick={() => scrollToSection('cervezas')}>Cervezas</button></li>
          <li><button onClick={() => scrollToSection('vinos')}>Vinos</button></li>
          <li><button onClick={() => scrollToSection('mocktails')}>Mocktails</button></li>
          <li><button onClick={() => scrollToSection('refrescos')}>Aguas y Refrescos</button></li>
          <li><button onClick={() => scrollToSection('delicateses')}>Delicias selectas</button></li>
        </ul>
      </div>

      <header className="carta-header">
        <Image src="/logo-eleven.webp" alt="Logo Eleven Club" width={200} height={70} className="max-h-[70px] mb-5" />
        <p>En un viaje hacia el origen, descubrimos una profunda conexión con nuestro ser interior, donde la creatividad fluye libremente alimentada por la confianza en lo que somos y en lo que podemos llegar a ser.
          Esta experiencia, un tanto mística e intensa, nos deja una sensación reconfortante de libertad y pensamiento guiada por una voz sabia que habita en los más profundo de nuestro interior.
          Así damos comienzo a un nuevo ciclo de disfrute, inspirados por nuevos estados de innovación transformando lo vivido en auténtico y real.</p>
        <h2 className="carta-h2">- CARTA -<br /><small>ft Juan Roda</small></h2>
        <p><em>Comenzamos con un Cocktail y no sabemos con cuál terminar</em></p>
      </header>


      <div className="carta-section">
        <h3 id="firma" className="carta-h3">Cocktails de firma</h3>
        <div className="carta-item"><span>GENESIS</span><span>$15.000</span></div>
        <div className="carta-desc">Vermut Tempestad, Tequila José Cuervo, Don mix, azahar</div>

        <div className="carta-item"><span>PANDEMONIO</span><span>$15.000</span></div>
        <div className="carta-desc">Gin Bulldog, almíbar, Albúmina, limón, wasabi</div>

        <div className="carta-item"><span>ELIXIR</span><span>$15.000</span></div>
        <div className="carta-desc">Chivas 12 años, miel, jengibre, pomelo</div>

        <div className="carta-item"><span>DULCE PESADILLA</span><span>$15.000</span></div>
        <div className="carta-desc">Ron Havana Club añejo, Frangelico, arándanos, lima, cacao, Franui</div>

        <div className="carta-item"><span>DELIRIO ESCOCÉS</span><span>$15.000</span></div>
        <div className="carta-desc">Johnnie Walker Black, frambuesas, hibisco, bitter de cacao y nuez</div>

        <div className="carta-item"><span>REISHI MARTINI</span><span>$15.000</span></div>
        <div className="carta-desc">Gin Bulldog, Reishi, oliva Zuelo Novello, limón</div>

        <div className="carta-item"><span>GIPSY HAVANA</span><span>$15.000</span></div>
        <div className="carta-desc">Havana Club mix, frutos rojos, hongo Shiitake y ají, limón, pomelo</div>

        <div className="carta-item"><span>VIEJO Y ELEGANTE</span><span>$15.000</span></div>
        <div className="carta-desc">Wild Turkey, azúcar de avellanas, bitter angostura, bitter de coco</div>

        <div className="carta-item"><span>SENCHA</span><span>$15.000</span></div>
        <div className="carta-desc">Vodka Absolut, tremella, limón, sencha, hibiscus</div>

        <div className="carta-item"><span>ABRAXAS</span><span>$15.000</span></div>
        <div className="carta-desc">Ron Havana Mix, orgeat, lima, limón, Vermut</div>

        <div className="carta-item"><span>ONCE</span><span>$15.000</span></div>
        <div className="carta-desc">Gin Bulldog, Pelargonium, limón, Aperol, jengibre, pomelo</div>

        <h3 id="eternos" className="carta-h3">Eternos</h3>
        <div className="carta-item"><span>NEGRONI</span><span>$10.000</span></div>
        <div className="carta-item"><span>GIN TONIC (Bulldog)</span><span>$10.000</span></div>
        <div className="carta-item"><span>OLD FASHIONED</span><span>$10.000</span></div>
        <div className="carta-item"><span>MARTINI</span><span>$10.000</span></div>
        <div className="carta-item"><span>MANHATTAN</span><span>$10.000</span></div>
        <div className="carta-item"><span>TOM COLLINS</span><span>$10.000</span></div>
        <div className="carta-item"><span>GIMLET</span><span>$10.000</span></div>
        <div className="carta-item"><span>BLOODY MARY</span><span>$10.000</span></div>
        <div className="carta-item"><span>DAIQUIRI COCKTAIL</span><span>$10.000</span></div>
        <div className="carta-item"><span>MINT JULEP</span><span>$10.000</span></div>

        <h3 id="vermut" className="carta-h3">Aperitivos y Vermut</h3>
        <div className="carta-item"><span>Campari tonic</span><span>$8.000</span></div>
        <div className="carta-item"><span>Cynar 70</span><span>$8.000</span></div>
        <div className="carta-item"><span>Cinzano Rosso</span><span>$8.000</span></div>
        <div className="carta-item"><span>Vermut Tempestad</span><span>$9.000</span></div>
        <div className="carta-item"><span>Vermut Tempestad de Bardo lata</span><span>$8.000</span></div>
        <div className="carta-item"><span>Amaro Averna</span><span>$7.000</span></div>

        <h3 id="spritz" className="carta-h3">Spritz Season</h3>
        <div className="carta-item"><span>Aperol Spritz</span><span>$12.000</span></div>
        <div className="carta-item"><span>Campari Spritz</span><span>$12.000</span></div>
        <div className="carta-item"><span>Cynar Spritz</span><span>$12.000</span></div>

        <h3 id="negronis" className="carta-h3">Negronis de la Casa</h3>
        <div className="carta-item"><span>Negroni Costero</span><span>$12.000</span></div>
        <div className="carta-item"><span>Negroni Soleria Blanco licoroso</span><span>$20.000</span></div>

        <h3 id="whisky" className="carta-h3">Whisky Escocés</h3>
        <div className="carta-item"><span>Chivas Regal 12 años</span><span>$14.000</span></div>
        <div className="carta-item"><span>Chivas XV Gold</span><span>$18.000</span></div>
        <div className="carta-item"><span>Chivas Regal 18 años</span><span>$26.000</span></div>
        <div className="carta-item"><span>Chivas Mizunara</span><span>$21.000</span></div>
        <div className="carta-item"><span>Chivas Ultis Blended malt</span><span>$95.000</span></div>
        <div className="carta-item"><span>Royal Salute 21 years</span><span>$80.000</span></div>
        <div className="carta-item"><span>The Deacon</span><span>$28.000</span></div>
        <div className="carta-item"><span>Johnnie W Black label</span><span>$15.000</span></div>
        <div className="carta-item"><span>Johnnie W Doble Black</span><span>$20.000</span></div>
        <div className="carta-item"><span>Johnnie W Gold Reserve</span><span>$25.000</span></div>
        <div className="carta-item"><span>Johnnie W Green label</span><span>$45.000</span></div>
        <div className="carta-item"><span>Johnnie W 18 years label</span><span>$42.000</span></div>
        <div className="carta-item"><span>Johnnie W Blue label</span><span>$70.000</span></div>
        <div className="carta-item"><span>Glenmorangie Single Malt</span><span>$40.000</span></div>

        <h3 className="carta-h3">Whisky Irlandés</h3>
        <div className="carta-item"><span>Jameson</span><span>$15.000</span></div>
        <div className="carta-item"><span>Tullamore</span><span>$20.000</span></div>

        <h3 className="carta-h3">American Whisky - Kentucky</h3>
        <div className="carta-item"><span>Wild Turkey</span><span>$14.000</span></div>
        <div className="carta-item"><span>Wild Turkey 101</span><span>$20.000</span></div>
        <div className="carta-item"><span>Maker's Mark</span><span>$26.000</span></div>

        <h3 className="carta-h3">Tennessee</h3>
        <div className="carta-item"><span>Jack Daniel's</span><span>$17.000</span></div>
        <div className="carta-item"><span>Jack Daniel's Gentleman Jack</span><span>$25.000</span></div>
        <div className="carta-item"><span>Jack Daniel's Single Barrel</span><span>$30.000</span></div>

        <h3 id="gin" className="carta-h3">Gin</h3>
        <div className="carta-item"><span>Bulldog</span><span>$10.000</span></div>
        <div className="carta-item"><span>Bombay</span><span>$12.000</span></div>
        <div className="carta-item"><span>Citadelle</span><span>$17.000</span></div>
        <div className="carta-item"><span>Monkey 47</span><span>$26.000</span></div>
        <div className="carta-item"><span>Martín Miller's</span><span>$18.000</span></div>
        <div className="carta-item"><span>Hendricks</span><span>$15.000</span></div>
        <div className="carta-item"><span>Hendricks Flora Adora</span><span>$17.000</span></div>
        <div className="carta-item"><span>Malfy</span><span>$16.000</span></div>
        <div className="carta-item"><span>Malfy limone</span><span>$17.000</span></div>

        <h3 id="ron" className="carta-h3">Ron</h3>
        <div className="carta-item"><span>Havana club 3 años</span><span>$10.000</span></div>
        <div className="carta-item"><span>Havana club Añejo</span><span>$12.000</span></div>
        <div className="carta-item"><span>Havana club 7 años</span><span>$15.000</span></div>
        <div className="carta-item"><span style={{fontSize: '0.93rem'}}>Havana club selección de Maestros</span><span>$28.000</span></div>
        <div className="carta-item"><span>Appleton State Reserve 8</span><span>$20.000</span></div>
        <div className="carta-item"><span>Plantatium Original Dark</span><span>$12.000</span></div>
        <div className="carta-item"><span>Flor de caña slow 4 aged</span><span>$12.000</span></div>

        <h3 id="botellas" className="carta-h3">Servicio de botella (desde las 23 hs)</h3>
        <div className="carta-desc">Incluye cítricos, botánico y hielo Prisma</div>
        <div className="carta-item"><span>Gin Bulldog</span><span>$100.000</span></div>
        <div className="carta-item"><span>Vodka Absolut</span><span>$80.000</span></div>
        <div className="carta-item"><span>Chivas XV Gold</span><span>$210.000</span></div>
        <div className="carta-item"><span>Royal Salute 21</span><span>$500.000</span></div>
        <div className="carta-item"><span>Negroni Vendaval</span><span>$60.000</span></div>

        <h3 id="champagne" className="carta-h3">Champagne</h3>
        <div className="carta-item"><span>Veuve Clicquot Brut</span><span>$290.000</span></div>
        <div className="carta-item"><span>Moët & Chandon</span><span>$250.000</span></div>
        <div className="carta-item"><span>Dom Pérignon</span><span>$888.000</span></div>

        <h3 className="carta-h3">Espumantes</h3>
        <div className="carta-item"><span>Chandon Extra Brut</span><span>$35.000</span></div>
        <div className="carta-item"><span>Chandon Rosé</span><span>$35.000</span></div>
        <div className="carta-item"><span>Délice Rosé</span><span>$35.000</span></div>
        <div className="carta-item"><span>Baron B Extra Brut</span><span>$60.000</span></div>
        <div className="carta-item"><span>Baron B Rosé</span><span>$75.000</span></div>
        <div className="carta-item"><span>Cinzano To Spritz</span><span>$25.000</span></div>

        <h3 id="cervezas" className="carta-h3">Cervezas</h3>
        <div className="carta-item"><span>Budweiser</span><span>$5.000</span></div>
        <div className="carta-item"><span>Corona</span><span>$5.000</span></div>
        <div className="carta-item"><span>Stella Artois</span><span>$5.000</span></div>

        <h3 id="vinos" className="carta-h3">Vinos</h3>
        <div className="carta-item"><span>Ereditá Chardonnay</span><span>$25.000</span></div>
        <div className="carta-item"><span>Pulenta Rosado</span><span>$28.000</span></div>
        <div className="carta-item"><span>Gran Corte Piccolo Banfi Blend</span><span>$27.000</span></div>
        <div className="carta-item"><span>Zuccardi Q Malbec</span><span>$31.000</span></div>
        <div className="carta-item"><span style={{fontSize: '0.93rem'}}>Fumata Bianca Sauvignon Blanc PB</span><span>$40.000</span></div>
        <div className="carta-item"><span>Polígonos Malbec</span><span>$44.000</span></div>
        <div className="carta-item"><span>Polígonos Verdejo</span><span>$44.000</span></div>
        <div className="carta-item"><span>Polígonos Cabernet Franc</span><span>$44.000</span></div>
        <div className="carta-item"><span>Memorias de Ida Malbec</span><span>$90.000</span></div>
        <div className="carta-item"><span>Aluvional Gualtallary</span><span>$135.000</span></div>
        <div className="carta-item"><span>Piedra Infinita</span><span>$250.000</span></div>

        <h3 id="mocktails" className="carta-h3">Mocktails</h3>
        <div className="carta-item"><span>Cocktail sin alcohol</span><span>$12.000</span></div>

        <h3 id="refrescos" className="carta-h3">Aguas Nacionales</h3>
        <div className="carta-item"><span>Eco sin gas</span><span>$3.500</span></div>
        <div className="carta-item"><span>Eco con gas</span><span>$3.500</span></div>

        <h3 className="carta-h3">Aguas Importadas</h3>
        <div className="carta-item"><span>Perrier</span><span>$7.000</span></div>

        <h3 className="carta-h3">Refrescos</h3>
        <div className="carta-item"><span>Pepsi</span><span>$3.500</span></div>
        <div className="carta-item"><span>7up</span><span>$3.500</span></div>
        <div className="carta-item"><span>Agua tónica Schweppes</span><span>$3.500</span></div>
        <div className="carta-item"><span>Agua tónica Britvic</span><span>$4.500</span></div>
        <div className="carta-item"><span>Red Bull</span><span>$4.500</span></div>

        <h3 id="delicateses" className="carta-h3">Delicias selectas</h3>
        <div className="carta-item"><span style={{fontSize: '0.85rem'}}>Verduras marinadas con pan orgánico</span><span>$10.000</span></div>
        <div className="carta-desc">Berenjenas asadas, tomates y verduras marinadas alineados con oliva extra virgen, pesto y pan</div>

        <div className="carta-item"><span style={{fontSize: '0.85rem'}}>Jamón serrano <br />con pan orgánico y Stracciatella</span><span>$12.000</span></div>
        <div className="carta-desc">Tostón con stracciatella, láminas de jamón de 14 meses y brotes de rúcula salvaje</div>

        <div className="carta-item"><span style={{fontSize: '0.85rem'}}>Ración de quesos blandos y duros</span><span>$10.000</span></div>
        <div className="carta-desc">Cortes de quesos artesanales acompañados de rodaja de pan</div>

        <div className="carta-item"><span style={{fontSize: '0.85rem'}}>Papas Gauchescas</span><span>$8.000</span></div>
        <div className="carta-desc">Papas Gauchitas, láminas de jamón serrano y escamas de charqui del Noroeste Argentino y mayonesa ahumada</div>
      </div>
    </>
  )
}
