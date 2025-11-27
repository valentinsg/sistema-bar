"use client"

import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface MenuItem {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  disponible: boolean
  orden: number
}

interface Category {
  id: string
  nombre: string
  orden: number
  items: MenuItem[]
}

export default function CartaPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCarta = async () => {
      try {
        // Obtener categorías
        const { data: categoriasData } = await supabase
          .from("categorias_carta")
          .select("*")
          .eq("local_id", "eleven-club")
          .order("orden", { ascending: true })

        if (!categoriasData) {
          setLoading(false)
          return
        }

        // Obtener items para cada categoría
        const categoriesWithItems = await Promise.all(
          categoriasData.map(async (cat) => {
            const { data: itemsData } = await supabase
              .from("items_carta")
              .select("*")
              .eq("categoria_id", cat.id)
              .eq("disponible", true)
              .order("orden", { ascending: true })

            return {
              ...cat,
              items: itemsData || []
            }
          })
        )

        setCategories(categoriesWithItems)
      } catch (error) {
        console.error("Error loading carta:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCarta()
  }, [])

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Image
            src="/logo-eleven.webp"
            alt="Eleven Club"
            width={100}
            height={100}
            className="mx-auto"
          />
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-legquinne text-xl">Cargando carta...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-16 pb-8 px-4"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo-eleven.webp"
              alt="Eleven Club"
              width={120}
              height={120}
              className="opacity-90"
            />
          </div>

          {/* Title */}
          <h1 className="font-legquinne text-5xl md:text-6xl tracking-wider">
            Eleven Club
          </h1>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/30" />
            <span className="font-legquinne text-2xl md:text-3xl tracking-widest">Menú</span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          {/* Subtitle */}
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-4">
            En un viaje hacia el origen, descubrimos una profunda conexión con nuestro ser interior,
            donde la creatividad fluye libremente alimentada por la confianza en lo que somos y en lo que podemos llegar a ser.
          </p>

          <p className="text-white/40 italic text-xs md:text-sm">
            Comenzamos con un Cocktail, y no sabemos con cuál terminar
          </p>
        </div>
      </motion.div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-16">
        {categories.map((category, categoryIndex) => (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            className="relative"
          >
            {/* Category Title */}
            <div className="mb-8 md:mb-12">
              <div className="relative inline-block">
                <h2 className="font-legquinne text-3xl md:text-4xl tracking-wide relative z-10 px-8 py-3 border-2 border-white/20">
                  {category.nombre}
                </h2>
                <div className="absolute -top-1 -left-1 w-full h-full border-2 border-orange-500/40" />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-6 md:space-y-8">
              {category.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: itemIndex * 0.05 }}
                  className="group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Item Name */}
                    <div className="flex-1">
                      <h3 className="font-legquinne text-xl md:text-2xl text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">
                        {item.nombre}
                      </h3>
                      {item.descripcion && (
                        <p className="text-white/70 text-sm md:text-base leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0">
                      <span className="font-legquinne text-xl md:text-2xl text-white whitespace-nowrap">
                        {formatPrice(item.precio)}
                      </span>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="mt-4 h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center items-center gap-8 flex-wrap pt-8"
        >
          <Image src="/budweiser.png" alt="Budweiser" width={60} height={40} className="h-8 w-auto opacity-60" />
          <Image src="/bulldog_logo.png" alt="Bulldog" width={80} height={40} className="h-10 w-auto opacity-60" />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Eleven Club. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
