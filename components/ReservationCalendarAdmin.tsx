"use client"

import { useReservas, useReservasRealtime } from "@/hooks/useReservas"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CalendarUI } from "./ui/CalendarUI"

interface ReservationCalendarAdminProps {
  localId: string
}

export default function ReservationCalendarAdmin({ localId }: ReservationCalendarAdminProps) {
  const [mounted, setMounted] = useState(false)

  // Asegurar que el componente se monte correctamente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Validar localId
  if (!localId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-400">Error: No se pudo obtener el ID del local</div>
      </div>
    )
  }

  // Mostrar loading mientras se monta
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-400">Cargando calendario...</span>
      </div>
    )
  }

  return <CalendarContent localId={localId} />
}

function CalendarContent({ localId }: { localId: string }) {
  try {
    const { allReservas, loading, loadAllReservas, handleDeleteReserva } = useReservas(localId)

    // Suscripción en tiempo real para admin
    useReservasRealtime(localId, loadAllReservas)

    return (
      <CalendarUI
        isAdmin={true}
        allReservas={allReservas || []}
        loading={loading}
        onDeleteReserva={handleDeleteReserva}
      />
    )
  } catch (err) {
    console.error("Error en CalendarContent:", err)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-400">
          Error al cargar el calendario. Por favor, recarga la página.
        </div>
      </div>
    )
  }
}
