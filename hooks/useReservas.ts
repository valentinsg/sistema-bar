"use client"

import { deleteReserva, getReservas, type Reserva } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react"

// Cache en memoria para evitar llamadas repetidas
const calendarCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 segundos

export function useReservas(localId: string) {
  const [allReservas, setAllReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)

  // Función optimizada para cargar todas las reservas una sola vez
  const loadAllReservas = useCallback(async () => {
    const cacheKey = `reservas-${localId}`
    const cached = calendarCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setAllReservas(cached.data)
      return
    }

    setLoading(true)
    try {
      const reservas = await getReservas(localId)
      setAllReservas(reservas)

      // Guardar en cache
      calendarCache.set(cacheKey, {
        data: reservas,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error("Error al cargar reservas:", error)
      setAllReservas([])
    } finally {
      setLoading(false)
    }
  }, [localId])

  const handleDeleteReserva = async (id: string, nombre: string) => {
    const success = await deleteReserva(id)
    if (success) {
      // Limpiar cache y recargar
      calendarCache.clear()
      await loadAllReservas()
    } else {
      alert("Error al eliminar la reserva. Intenta nuevamente.")
    }
  }

  // Cargar datos solo una vez al montar el componente
  useEffect(() => {
    loadAllReservas()
  }, [loadAllReservas])

  return {
    allReservas,
    setAllReservas,
    loading,
    loadAllReservas,
    handleDeleteReserva
  }
}

// Hook para suscripción en tiempo real (solo para admin)
export function useReservasRealtime(localId: string, loadAllReservas: () => Promise<void>) {
  useEffect(() => {
    const subscription = supabase
      .channel('reservas_changes')
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
          loadAllReservas()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [localId, loadAllReservas])
}
