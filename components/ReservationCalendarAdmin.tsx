"use client"

import { useReservas, useReservasRealtime } from "@/hooks/useReservas"
import { CalendarUI } from "./CalendarUI"

export default function ReservationCalendarAdmin() {
  const localId = process.env.NEXT_PUBLIC_LOCAL_ID!
  const { allReservas, loading, loadAllReservas, handleDeleteReserva } = useReservas(localId)

  // Suscripción en tiempo real para admin
  useReservasRealtime(localId, loadAllReservas)

  return (
    <CalendarUI
      isAdmin={true}
      allReservas={allReservas}
      loading={loading}
      onDeleteReserva={handleDeleteReserva}
    />
  )
}
