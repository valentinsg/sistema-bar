// 📁 lib/storage.ts (Versión conectada a Supabase)

import { supabase } from "./supabase"

export interface Reserva {
  id: string
  local_id: string
  nombre: string
  contacto: string
  fecha: string
  horario: string
  cantidad_personas: number
  notas?: string | null
  created_at: string
}

export const saveReserva = async (reserva: Omit<Reserva, "id" | "created_at">): Promise<Reserva> => {
  const { data, error } = await supabase
    .from("reservas")
    .insert([reserva])
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    ...reserva,
    created_at: data.created_at,
  }
}

export const getReservas = async (local_id: string): Promise<Reserva[]> => {
  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .eq("local_id", local_id)
    .order("fecha", { ascending: true })

  if (error) {
    console.error("Error al obtener reservas:", error.message, error.details, error.hint)
    return []
  }

  return data as Reserva[]
}

export const deleteReserva = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("reservas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error al eliminar reserva:", error.message)
    return false
  }

  return true
}

export const getContador = async (local_id: string): Promise<number> => {
  const fechaHoy = new Date().toISOString().split("T")[0]

  console.log("📊 getContador - Parámetros:", { local_id, fecha: fechaHoy })

  const { data, error } = await supabase
    .from("contador_personas")
    .select("cantidad")
    .eq("local_id", local_id)
    .eq("fecha", fechaHoy)
    .single()

  if (error) {
    console.log("ℹ️ getContador - Error (puede ser normal si no existe):", error.message)
    return 0
  }

  if (!data) {
    console.log("ℹ️ getContador - No hay datos para hoy, retornando 0")
    return 0
  }

  console.log("✅ getContador - Cantidad encontrada:", data.cantidad)
  return data.cantidad
}

export const updateContador = async (local_id: string, cantidad: number): Promise<boolean> => {
  const fechaHoy = new Date().toISOString().split("T")[0]

  try {
    console.log("🔄 Actualizando contador en BD:", { local_id, fecha: fechaHoy, cantidad })

    const { error } = await supabase
      .from("contador_personas")
      .upsert({
        local_id,
        fecha: fechaHoy,
        cantidad,
      }, {
        onConflict: 'local_id,fecha'
      })

    if (error) {
      console.error("❌ Error al actualizar contador:", error)
      return false
    }

    console.log("✅ Contador actualizado exitosamente en BD")

    // Disparar evento solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      console.log("📡 Disparando evento contadorUpdated")
      window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: cantidad } }))
    }

    return true
  } catch (error) {
    console.error("❌ Error al actualizar contador:", error)
    return false
  }
}

export const getDisponibilidad = async (local_id: string, fecha: string, horario: string): Promise<number> => {
  const MESAS_TOTALES = 50

  try {
    // Obtener todas las reservas del día para calcular mesas ocupadas totales
    const { data: reservasDelDia, error } = await supabase
      .from("reservas")
      .select("cantidad_personas")
      .eq("local_id", local_id)
      .eq("fecha", fecha)

    if (error) {
      console.error("Error al obtener reservas:", error)
      return MESAS_TOTALES
    }

    if (!reservasDelDia || reservasDelDia.length === 0) {
      return MESAS_TOTALES
    }

    // Calcular mesas ocupadas para todo el día: cada 4 personas ocupan 1 mesa
    const mesasOcupadasDelDia = reservasDelDia.reduce((acc: number, r: { cantidad_personas: number }) => {
      return acc + Math.ceil(r.cantidad_personas / 4)
    }, 0)

    const mesasDisponibles = Math.max(0, MESAS_TOTALES - mesasOcupadasDelDia)

    return mesasDisponibles

  } catch (error) {
    console.error("Error en getDisponibilidad:", error)
    return MESAS_TOTALES
  }
}

export const getMesasEstadisticas = async (local_id: string, fecha: string): Promise<{
  mesasTotales: number
  mesasOcupadas: number
  mesasDisponibles: number
  personasTotales: number
}> => {
  const MESAS_TOTALES = 50

  const { data, error } = await supabase
    .from("reservas")
    .select("cantidad_personas")
    .eq("local_id", local_id)
    .eq("fecha", fecha)

  if (error || !data) {
    return {
      mesasTotales: MESAS_TOTALES,
      mesasOcupadas: 0,
      mesasDisponibles: MESAS_TOTALES,
      personasTotales: 0
    }
  }

  const personasTotales = data.reduce((acc: number, r: { cantidad_personas: number }) => acc + r.cantidad_personas, 0)
  const mesasOcupadas = data.reduce((acc: number, r: { cantidad_personas: number }) => {
    return acc + Math.ceil(r.cantidad_personas / 4)
  }, 0)

  return {
    mesasTotales: MESAS_TOTALES,
    mesasOcupadas,
    mesasDisponibles: Math.max(0, MESAS_TOTALES - mesasOcupadas),
    personasTotales
  }
}
