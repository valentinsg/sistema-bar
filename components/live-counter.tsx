"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { getContador } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function LiveCounter() {
  const [loading, setLoading] = useState(true)  
  const [contador, setContador] = useState<number>(0)
  const [showCounter, setShowCounter] = useState(false)

  useEffect(() => {
    // Verificar si las variables de entorno están configuradas
    if (!LOCAL_ID) {
      console.error("❌ NEXT_PUBLIC_LOCAL_ID no está configurado")
      setLoading(false)
      return
    }

    const checkTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Mostrar siempre en desarrollo/localhost o desde las 19:00 hasta las 06:00
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'
      
      const isOperatingTime = hour >= 19 || hour < 6
      
      setShowCounter(isDevelopment || isOperatingTime)
    }

    const cargarContador = async () => {
      try {
        console.log("🔄 Cargando contador para LOCAL_ID:", LOCAL_ID)
        const contadorData = await getContador(LOCAL_ID)
        console.log("📊 Cantidad recibida del servidor:", contadorData)
        setContador(contadorData)
        console.log("✅ Estado actualizado en frontend:", contadorData)
      } catch (error) {
        console.error("❌ Error al cargar contador:", error)
        setContador(0)
      } finally {
        setLoading(false)
      }
    }

    checkTime()
    cargarContador()

    // Verificar tiempo cada minuto
    const timeInterval = setInterval(checkTime, 60000)
    
    // Recargar contador cada 30 segundos para mantenerlo actualizado
    const contadorInterval = setInterval(cargarContador, 30000)

    // Suscribirse a cambios en tiempo real de Supabase
    const contadorSubscription = supabase
      .channel('contador_personas_changes_front')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contador_personas',
          filter: `local_id=eq.${LOCAL_ID}`
        },
        (payload) => {
          console.log("🔄 Cambio en tiempo real recibido en frontend:", payload)
          console.log("📊 Payload completo:", JSON.stringify(payload, null, 2))
          if (payload.new && 'cantidad' in payload.new) {
            const nuevaCantidad = payload.new.cantidad as number
            console.log("✅ Actualizando contador frontend a:", nuevaCantidad)
            setContador(nuevaCantidad)
          } else {
            console.log("❌ No se encontró cantidad en payload.new")
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado suscripción contador:", status)
      })

    // Escuchar eventos de actualización del contador (para compatibilidad)
    const handleContadorUpdate = (event: CustomEvent) => {
      console.log("📡 Evento contador recibido:", event.detail.personas)
      setContador(event.detail.personas)
    }

    window.addEventListener("contadorUpdated", handleContadorUpdate as EventListener)

    return () => {
      clearInterval(timeInterval)
      clearInterval(contadorInterval)
      contadorSubscription.unsubscribe()
      window.removeEventListener("contadorUpdated", handleContadorUpdate as EventListener)
    }
  }, [])

  // No mostrar si no está configurado o si no es el horario correcto
  if (!showCounter || !LOCAL_ID) return null

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-purple-300" />
              <span className="text-purple-300 font-medium">EN VIVO</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">...</div>
              <p className="text-purple-200 text-sm">Cargando...</p>
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm mx-auto mb-12 bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-purple-300" />
            <span className="text-purple-300 font-medium">EN VIVO</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white">{contador}</div>
            <p className="text-purple-200 text-sm">
              {contador === 1 ? "persona" : "personas"} ahora mismo en el local
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
