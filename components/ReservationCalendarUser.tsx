"use client"

import { useReservas } from "@/hooks/useReservas"
import { CalendarUI } from "./ui/CalendarUI"

interface ReservationCalendarUserProps {
  selectedDate?: string
  selectedTime?: string
  onDateSelect?: (date: string) => void
  onTimeSelect?: (time: string) => void
}

export default function ReservationCalendarUser({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect
}: ReservationCalendarUserProps = {}) {
  const localId = process.env.NEXT_PUBLIC_LOCAL_ID!
  const { allReservas, loading } = useReservas(localId)

  return (
    <CalendarUI
      isAdmin={false}
      allReservas={allReservas}
      loading={loading}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onDateSelect={onDateSelect}
      onTimeSelect={onTimeSelect}
    />
  )
}
