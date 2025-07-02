"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Reserva } from "@/lib/storage"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Clock, Info, Loader2, Phone, Trash2, User, Users } from "lucide-react"
import { useMemo, useState } from "react"

interface CalendarUIProps {
  isAdmin: boolean
  allReservas: Reserva[]
  loading: boolean
  onDeleteReserva?: (id: string, nombre: string) => Promise<void>
}

export function CalendarUI({ isAdmin, allReservas, loading, onDeleteReserva }: CalendarUIProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const horarios = useMemo(() => ["19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"], [])

  // Funciones auxiliares
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)

    return days
  }

  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
    const dayStr = day.toString().padStart(2, "0")
    return `${year}-${month}-${dayStr}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (day: number) => {
    const today = new Date()
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())

    return dayNormalized < todayNormalized
  }

  // Memoizar datos calculados para evitar recálculos innecesarios
  const reservasPorDia = useMemo(() => {
    const fechasEnMes = getDaysInMonth(currentDate)
      .filter((d): d is number => d !== null)
      .map((day) => formatDateString(day))

    const nuevasReservas: Record<string, number> = {}
    fechasEnMes.forEach((fecha) => {
      nuevasReservas[fecha] = allReservas.filter((r) => r.fecha === fecha).length
    })
    return nuevasReservas
  }, [allReservas, currentDate])

  const reservasDelDia = useMemo(() => {
    return allReservas.filter((r) => r.fecha === selectedDate)
  }, [allReservas, selectedDate])

  const disponibilidadPorHorario = useMemo(() => {
    const PLAZAS_TOTALES = 30
    const plazasOcupadasDelDia = reservasDelDia.reduce((acc, r) => {
      return acc + r.cantidad_personas
    }, 0)
    const plazasDisponibles = Math.max(0, PLAZAS_TOTALES - plazasOcupadasDelDia)

    const nuevaDisponibilidad: Record<string, number> = {}
    horarios.forEach(horario => {
      nuevaDisponibilidad[horario] = plazasDisponibles
    })
    return nuevaDisponibilidad
  }, [reservasDelDia, horarios])

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="space-y-8 p-2 sm:p-4 max-w-[560px] mx-auto font-source-sans">
      {/* Calendario Principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Fondo con imagen */}
        <div className="absolute inset-0 rounded-xl overflow-hidden" style={{ minHeight: '100%' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-orange-900/50"></div>
        </div>

        <Card className="relative overflow-hidden bg-transparent border-2 border-orange-500/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="relative z-10 bg-gradient-to-r from-orange-500/25 to-red-500/20 border-b-2 border-orange-500/40 backdrop-blur-md px-2 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-legquinne font-normal">
                    <div className="p-2 bg-gradient-to-br from-orange-500/25 to-red-500/20 rounded-xl border-2 border-orange-400/40 shadow-lg">
                      <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-orange-200" />
                    </div>
                    <span className="block leading-tight">Calendario<br className="sm:hidden"/>de Reservas</span>
                    {loading && <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-orange-400" />}
                  </CardTitle>
                  <CardDescription className="text-white/95 text-sm sm:text-lg font-medium mt-1 leading-tight">
                    Selecciona una fecha para ver disponibilidad{isAdmin ? " y gestionar reservas" : ""}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-8 relative z-10">
            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="group relative overflow-hidden bg-black/70 border-2 border-orange-500/40 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/40 hover:to-red-500/30 hover:border-orange-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 backdrop-blur-md px-2 py-2 sm:px-4 sm:py-3 rounded-xl"
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <h3 className="text-xl sm:text-3xl font-bold font-legquinne text-transparent bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text drop-shadow-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="group relative overflow-hidden bg-black/70 border-2 border-orange-500/40 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/40 hover:to-red-500/30 hover:border-orange-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 backdrop-blur-md px-2 py-2 sm:px-4 sm:py-3 rounded-xl"
                disabled={loading}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-6">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs sm:text-base font-bold text-orange-200 py-2 sm:py-4 bg-black/60 rounded-xl border-2 border-orange-500/30 backdrop-blur-md shadow-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {getDaysInMonth(currentDate).map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} className="h-10 sm:h-16" />
                const dateStr = formatDateString(day)
                const reservasCount = reservasPorDia[dateStr] || 0
                const isSelected = selectedDate === dateStr
                const todayClass = isToday(day)
                const pastDate = isPastDate(day)

                return (
                  <button
                    key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                    onClick={() => setSelectedDate(dateStr)}
                    disabled={pastDate || loading}
                    className={`h-10 sm:h-16 rounded-xl text-xs sm:text-base font-bold transition-all duration-300 relative overflow-hidden group backdrop-blur-md shadow-lg
                      ${isSelected ?
                        "bg-gradient-to-br from-orange-600/90 to-red-600/80 text-white shadow-xl shadow-orange-500/40 scale-110 border-2 border-orange-300/60 backdrop-blur-md" :
                        pastDate ?
                          "text-gray-500 cursor-not-allowed bg-black/30 border border-gray-600/30" :
                          todayClass ?
                            "bg-gradient-to-br from-orange-500/50 to-red-500/40 text-orange-100 border-2 border-orange-400/60 shadow-lg shadow-orange-500/30 hover:scale-110" :
                            "text-white bg-black/60 hover:bg-gradient-to-br hover:from-orange-500/40 hover:to-red-500/30 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20 border-2 border-orange-500/30 hover:border-orange-400/50"
                      }`}>
                    <span className="relative z-10">{day}</span>

                    {/* Indicador de reservas */}
                    {reservasCount > 0 && !pastDate && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-[10px] sm:text-sm flex items-center justify-center text-white font-bold shadow-xl animate-pulse z-20 border-2 border-red-300/50">
                        {reservasCount}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detalles del día seleccionado */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-red-900/50"></div>
          </div>

          <Card className="relative overflow-hidden bg-transparent border-2 border-orange-500/40 backdrop-blur-xl shadow-2xl">
            <CardHeader className="relative z-10 bg-gradient-to-r from-red-500/25 to-orange-500/20 border-b-2 border-orange-500/40 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-3 text-2xl font-legquinne font-normal">
                      <div className="p-2.5 bg-gradient-to-br from-red-500/25 to-orange-500/20 rounded-xl border-2 border-red-400/40 shadow-lg">
                        <Clock className="w-7 h-7 text-red-200" />
                      </div>
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 relative z-10">
              {reservasDelDia.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500/25 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-500/40 shadow-lg">
                    <Calendar className="w-12 h-12 text-orange-300" />
                  </div>
                  <p className="text-white/90 text-2xl font-legquinne font-medium mb-2">No hay reservas para esta fecha</p>
                  <p className="text-white/70 text-lg">¡Perfecto para nuevas reservas!</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Disponibilidad por horario */}
                  <div>
                    <h4 className="text-white font-bold text-lg sm:text-2xl mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 font-legquinne">
                      <div className="w-2 h-6 sm:w-3 sm:h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full shadow-lg"></div>
                      <span className="leading-tight">Disponibilidad<br className='sm:hidden'/>por horario</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                      {horarios.map((horario) => {
                        const disponibles = disponibilidadPorHorario[horario] ?? "-"
                        const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
                        const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)
                        const ocupacion = typeof disponibles === "number" ? ((30 - disponibles) / 30) * 100 : 0

                        return (
                          <div key={horario} className="bg-black/70 rounded-xl p-6 border-2 border-orange-500/40 hover:border-orange-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 backdrop-blur-md hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-white font-bold text-xl">{horario}</span>
                              <Badge
                                className={`text-sm font-bold px-4 py-2 rounded-lg shadow-lg ${typeof disponibles === "number" && disponibles > 30 ? "bg-green-500/25 text-green-200 border-2 border-green-500/40" :
                                    typeof disponibles === "number" && disponibles > 15 ? "bg-yellow-500/25 text-yellow-200 border-2 border-yellow-500/40" :
                                      "bg-red-500/25 text-red-200 border-2 border-red-500/40"
                                  }`}
                              >
                                {disponibles}/30 libres
                              </Badge>
                            </div>

                            {/* Barra de ocupación */}
                            <div className="w-full bg-black/60 rounded-full h-3 mb-4 overflow-hidden border-2 border-orange-500/30 shadow-inner">
                              <div
                                className={`h-full transition-all duration-700 shadow-lg ${ocupacion > 70 ? "bg-gradient-to-r from-red-500 to-red-600" :
                                    ocupacion > 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                                      "bg-gradient-to-r from-green-500 to-green-600"
                                  }`}
                                style={{ width: `${ocupacion}%` }}
                              />
                            </div>

                            {reservasEnHorario.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 text-base">
                                  <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-400/30">
                                    <Users className="w-5 h-5 text-orange-300" />
                                  </div>
                                  <span className="text-orange-200 font-semibold">
                                    {reservasEnHorario.length} reserva{reservasEnHorario.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="text-base text-white/90 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                  <strong>{personasEnHorario}</strong> personas total
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-base text-white/60">
                                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                Sin reservas
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Lista de reservas para admin */}
                  {isAdmin && (
                    <div>
                      <h4 className="text-white font-bold text-2xl mb-8 flex items-center gap-3 font-legquinne">
                        <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full shadow-lg"></div>
                        Reservas del día
                      </h4>
                      <div className="space-y-6">
                        {reservasDelDia.map((reserva, index) => (
                          <div key={reserva.id} className="bg-black/70 rounded-xl p-8 border-2 border-orange-500/40 hover:border-orange-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 group backdrop-blur-md hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/25 to-red-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40 shadow-lg">
                                    <User className="w-6 h-6 text-orange-300" />
                                  </div>
                                  <h5 className="text-white font-bold text-2xl">{reserva.nombre}</h5>
                                  <Badge className="bg-orange-500/25 text-orange-200 border-2 border-orange-500/40 text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                                    #{index + 1}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                  <div className="flex items-center gap-3 text-white/90 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                    <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-400/30">
                                      <Phone className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <span className="font-semibold text-lg">{reserva.contacto}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-8 text-base">
                                  <div className="flex items-center gap-3 text-orange-200 bg-gradient-to-r from-orange-500/15 to-yellow-500/10 px-4 py-3 rounded-xl border-2 border-orange-500/30 shadow-lg">
                                    <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-400/30">
                                      <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-lg">{reserva.horario}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-red-200 bg-gradient-to-r from-red-500/15 to-pink-500/10 px-4 py-3 rounded-xl border-2 border-red-500/30 shadow-lg">
                                    <div className="p-1.5 bg-red-500/20 rounded-lg border border-red-400/30">
                                      <Users className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-lg">{reserva.cantidad_personas} personas</span>
                                  </div>
                                  <Badge className="border-2 border-orange-500/60 text-orange-200 bg-gradient-to-r from-orange-500/15 to-yellow-500/10 font-bold text-base px-4 py-2 rounded-xl shadow-lg">
                                    {reserva.cantidad_personas} plaza{reserva.cantidad_personas !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              </div>

                              <div className="ml-8">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      className="border-2 border-red-500/60 text-red-300 bg-gradient-to-r from-red-500/15 to-pink-500/10 hover:bg-gradient-to-r hover:from-red-500/25 hover:to-pink-500/15 hover:border-red-400/80 hover:text-red-200 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-md px-4 py-3 rounded-xl font-bold"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gradient-to-br from-black/98 to-gray-900/95 border-2 border-orange-500/40 backdrop-blur-xl rounded-xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white text-2xl font-legquinne font-bold">¿Eliminar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-white/90 text-lg leading-relaxed">
                                        ¿Estás seguro de que quieres eliminar la reserva de <strong className="text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded-md">{reserva.nombre}</strong>?
                                        Esta acción no se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-black/70 text-white border-2 border-orange-500/40 hover:bg-black/90 transition-all duration-300 backdrop-blur-md rounded-xl px-6 py-3 font-semibold">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => onDeleteReserva?.(reserva.id, reserva.nombre)}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-red-500/40 rounded-xl px-6 py-3 font-bold text-lg"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
