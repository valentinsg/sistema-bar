"use client"

import { useReservas } from "@/hooks/useReservas"
import { CalendarUI } from "./ui/CalendarUI"

export default function ReservationCalendarUser() {
  const localId = process.env.NEXT_PUBLIC_LOCAL_ID!
  const { allReservas, loading } = useReservas(localId)

  return (
    <CalendarUI
      isAdmin={false}
      allReservas={allReservas}
      loading={loading}
    />
  )
}
