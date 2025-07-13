"use client"

import { deleteReserva, getReservas, type Reserva } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useRef, useState } from "react"

// Cache en memoria para evitar llamadas repetidas
const calendarCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 segundos

// Mapa global para rastrear suscripciones activas
const activeSubscriptions = new Map<string, any>()

export function useReservas(localId: string) {
  const [allReservas, setAllReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función optimizada para cargar todas las reservas una sola vez
  const loadAllReservas = useCallback(async () => {
    if (!localId) {
      console.error("No se proporcionó localId")
      setError("No se proporcionó localId")
      return
    }

    const cacheKey = `reservas-${localId}`
    const cached = calendarCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setAllReservas(cached.data)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reservas = await getReservas(localId)

      // Validar que reservas es un array
      if (!Array.isArray(reservas)) {
        throw new Error("Los datos de reservas no son válidos")
      }

      setAllReservas(reservas)

      // Guardar en cache
      calendarCache.set(cacheKey, {
        data: reservas,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error("Error al cargar reservas:", error)
      setError("Error al cargar las reservas")
      setAllReservas([])
    } finally {
      setLoading(false)
    }
  }, [localId])

  const handleDeleteReserva = async (id: string, nombre: string) => {
    if (!id) {
      console.error("No se proporcionó ID de reserva")
      return
    }

    try {
      const success = await deleteReserva(id)
      if (success) {
        // Limpiar cache y recargar
        calendarCache.clear()
        await loadAllReservas()
      } else {
        alert("Error al eliminar la reserva. Intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error al eliminar reserva:", error)
      alert("Error al eliminar la reserva. Intenta nuevamente.")
    }
  }

  // Cargar datos solo una vez al montar el componente
  useEffect(() => {
    if (localId) {
      loadAllReservas()
    }
  }, [loadAllReservas, localId])

  return {
    allReservas,
    setAllReservas,
    loading,
    error,
    loadAllReservas,
    handleDeleteReserva
  }
}

// Hook para suscripción en tiempo real (solo para admin)
export function useReservasRealtime(localId: string, loadAllReservas: () => Promise<void>) {
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!localId || !loadAllReservas) {
      return
    }

    const subscriptionKey = `reservas_${localId}`

    // Si ya hay una suscripción activa para este localId, no crear otra
    if (activeSubscriptions.has(subscriptionKey)) {
      return
    }

    try {
      const subscription = supabase
        .channel(`reservas_changes_${localId}_${Date.now()}`) // Canal único con timestamp
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reservas',
            filter: `local_id=eq.${localId}`
          },
          () => {
            // Limpiar cache y recargar
            calendarCache.clear()
            loadAllReservas().catch(console.error)
          }
        )
        .subscribe()

      subscriptionRef.current = subscription
      activeSubscriptions.set(subscriptionKey, subscription)

    } catch (error) {
      console.error("Error al configurar suscripción en tiempo real:", error)
    }

    return () => {
      const subscriptionKey = `reservas_${localId}`

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe()
          activeSubscriptions.delete(subscriptionKey)
        } catch (error) {
          console.error("Error al desuscribirse:", error)
        }
      }
    }
  }, [localId, loadAllReservas])
}
