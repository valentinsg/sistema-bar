import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Trago {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  ingredientes: string[]
  alcoholico: boolean
}

const tragos: Trago[] = [
  {
    id: "1",
    nombre: "Mojito",
    descripcion: "Refrescante cóctel cubano con ron blanco, menta, lima y azúcar",
    precio: 1200,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Ron blanco", "Menta", "Lima", "Azúcar", "Soda"],
    alcoholico: true
  },
  {
    id: "2",
    nombre: "Margarita",
    descripcion: "Cóctel mexicano con tequila, triple sec y jugo de lima",
    precio: 1300,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Tequila", "Triple sec", "Lima", "Sal"],
    alcoholico: true
  },
  {
    id: "3",
    nombre: "Negroni",
    descripcion: "Cóctel italiano con ginebra, vermut rosso y bitter",
    precio: 1400,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Ginebra", "Vermut rosso", "Bitter"],
    alcoholico: true
  },
  {
    id: "4",
    nombre: "Gin Tonic",
    descripcion: "Clásico británico con ginebra premium y tónica artesanal",
    precio: 1100,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Ginebra", "Tónica", "Lima"],
    alcoholico: true
  },
  {
    id: "5",
    nombre: "Old Fashioned",
    descripcion: "Cóctel americano con whisky bourbon, bitter y azúcar",
    precio: 1500,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Whisky bourbon", "Bitter", "Azúcar", "Naranja"],
    alcoholico: true
  },
  {
    id: "6",
    nombre: "Caipirinha",
    descripcion: "Cóctel brasileño con cachaça, lima y azúcar",
    precio: 1200,
    categoria: "Cócteles Clásicos",
    ingredientes: ["Cachaça", "Lima", "Azúcar"],
    alcoholico: true
  },
  {
    id: "7",
    nombre: "Limonada de Frutos Rojos",
    descripcion: "Refrescante limonada con frambuesas, frutillas y menta",
    precio: 800,
    categoria: "Sin Alcohol",
    ingredientes: ["Limonada", "Frambuesas", "Frutillas", "Menta"],
    alcoholico: false
  },
  {
    id: "8",
    nombre: "Mojito Sin Alcohol",
    descripcion: "Versión sin alcohol del clásico mojito",
    precio: 700,
    categoria: "Sin Alcohol",
    ingredientes: ["Lima", "Menta", "Azúcar", "Soda"],
    alcoholico: false
  },
  {
    id: "9",
    nombre: "Cerveza Artesanal",
    descripcion: "Selección de cervezas artesanales locales",
    precio: 900,
    categoria: "Cervezas",
    ingredientes: ["Cerveza artesanal"],
    alcoholico: true
  },
  {
    id: "10",
    nombre: "Vino Tinto",
    descripcion: "Vino tinto de bodega seleccionada",
    precio: 1000,
    categoria: "Vinos",
    ingredientes: ["Vino tinto"],
    alcoholico: true
  }
]

const categorias = ["Cócteles Clásicos", "Sin Alcohol", "Cervezas", "Vinos"]

export default function CartaPage() {
  const tragosPorCategoria = categorias.map(categoria => ({
    categoria,
    tragos: tragos.filter(trago => trago.categoria === categoria)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Carta del Bar</h1>
            <p className="text-gray-300">Eleven Club - Experiencia gastronómica única</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {tragosPorCategoria.map(({ categoria, tragos }) => (
            <div key={categoria} className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">{categoria}</h2>
                <Separator className="bg-white/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tragos.map((trago) => (
                  <Card key={trago.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-lg">{trago.nombre}</CardTitle>
                          <CardDescription className="text-gray-300 mt-1">
                            {trago.descripcion}
                          </CardDescription>
                        </div>
                        <Badge variant={trago.alcoholico ? "default" : "secondary"} className="ml-2">
                          {trago.alcoholico ? "Alcohólico" : "Sin alcohol"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-green-400">
                          ${trago.precio.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300 font-medium">Ingredientes:</p>
                        <div className="flex flex-wrap gap-1">
                          {trago.ingredientes.map((ingrediente, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300">
                              {ingrediente}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Precios sujetos a cambios sin previo aviso
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Eleven Club - Reserva tu lugar, eleva tus sentidos
          </p>
        </div>
      </div>
    </div>
  )
}
