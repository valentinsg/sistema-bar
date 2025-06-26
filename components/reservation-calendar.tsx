"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteReserva, getDisponibilidad, getReservas, type Reserva } from "@/lib/storage"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2, Phone, Trash2, User, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

interface ReservationCalendarProps {
  isAdmin?: boolean
}

export default function ReservationCalendar({ isAdmin = false }: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  // Auto-seleccionar fecha de hoy por defecto
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [reservasDelDia, setReservasDelDia] = useState<Reserva[]>([])
  const [reservasPorDia, setReservasPorDia] = useState<Record<string, number>>({})
  const [disponibilidadPorHorario, setDisponibilidadPorHorario] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [loadingDay, setLoadingDay] = useState(false)

  const horarios = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]

  const handleDeleteReserva = async (id: string, nombre: string) => {
    if (!isAdmin) return

    const success = await deleteReserva(id)
    if (success) {
      // Recargar los datos después de eliminar
      await loadSelectedDateData()
      await loadMonthData()
    } else {
      alert("Error al eliminar la reserva. Intenta nuevamente.")
    }
  }

  const loadMonthData = async () => {
    setLoading(true)
    try {
      const allReservas = await getReservas(LOCAL_ID)
      const fechasEnMes = getDaysInMonth(currentDate)
        .filter((d): d is number => d !== null)
        .map((day) => formatDateString(day))

      const nuevasReservas: Record<string, number> = {}
      fechasEnMes.forEach((fecha) => {
        nuevasReservas[fecha] = allReservas.filter((r) => r.fecha === fecha).length
      })
      setReservasPorDia(nuevasReservas)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedDateData = async () => {
    if (!selectedDate) return

    setLoadingDay(true)
    try {
      const allReservas = await getReservas(LOCAL_ID)
      const reservasDia = allReservas.filter((r) => r.fecha === selectedDate)
      setReservasDelDia(reservasDia)

      const nuevaDisponibilidad: Record<string, number> = {}
      for (const horario of horarios) {
        const disponibles = await getDisponibilidad(LOCAL_ID, selectedDate, horario)
        nuevaDisponibilidad[horario] = disponibles
      }
      setDisponibilidadPorHorario(nuevaDisponibilidad)
    } finally {
      setLoadingDay(false)
    }
  }

  useEffect(() => {
    loadMonthData()
  }, [currentDate])

  useEffect(() => {
    loadSelectedDateData()
  }, [selectedDate])

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

    // Normalizar fechas a solo el día (sin hora) para comparación correcta
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())

    return dayNormalized < todayNormalized
  }

  const isTodayAfter18 = (day: number) => {
    // Removemos la restricción - ahora siempre se puede reservar para hoy
    // Solo mantenemos la lógica para fechas pasadas
    return false
  }

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="space-y-8 p-4">
      {/* Calendario Principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Fondo con imagen */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <Image
            src="/FONDOS-01.webp"
            alt="Eleven Club background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-orange-900/40"></div>
        </div>

        <Card className="relative overflow-hidden bg-transparent border-orange-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="relative z-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo pequeño */}
                <Image
                  src="/logo-eleven.webp"
                  alt="Eleven Club"
                  width={40}
                  height={40}
                  className="opacity-90"
                />
                <div>
                  <CardTitle className="text-white flex items-center gap-3 text-xl font-legquinne font-normal">
                    <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-400/30">
                      <Calendar className="w-6 h-6 text-orange-300" />
            </div>
            Calendario de Reservas
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-orange-400" />}
          </CardTitle>
                  <CardDescription className="text-white/80 text-base">
            Selecciona una fecha para ver disponibilidad{isAdmin ? " y gestionar reservas" : ""}
          </CardDescription>
                </div>
              </div>
              {/* Elemento decorativo */}
              <Image
                src="/detalle-texto-eleven.webp"
                alt="Eleven Club detail"
                width={100}
                height={30}
                className="opacity-40 hidden md:block"
              />
            </div>
        </CardHeader>
          <CardContent className="p-6 relative z-10">
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="group relative overflow-hidden bg-black/60 border-orange-500/30 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:scale-105 backdrop-blur-sm"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 via-orange-400/5 to-red-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
              <h3 className="text-2xl font-bold font-legquinne text-transparent bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="group relative overflow-hidden bg-black/60 border-orange-500/30 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/20 hover:scale-105 backdrop-blur-sm"
              disabled={loading}
            >
              <ChevronRight className="w-4 h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 via-orange-400/5 to-red-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-orange-300 py-3 bg-black/40 rounded-lg border border-orange-500/20 backdrop-blur-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="h-14" />
              const dateStr = formatDateString(day)
              const reservasCount = reservasPorDia[dateStr] || 0
              const isSelected = selectedDate === dateStr
              const todayClass = isToday(day)
              const pastDate = isPastDate(day)
              const todayAfter18 = isTodayAfter18(day)

              return (
                <button
                  key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                  onClick={() => setSelectedDate(dateStr)}
                  disabled={pastDate || todayAfter18 || loading}
                    className={`h-14 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group backdrop-blur-sm
                    ${isSelected ?
                        "bg-gradient-to-br from-orange-600/80 to-red-600/80 text-white shadow-lg shadow-orange-500/30 scale-105 border-2 border-orange-400 backdrop-blur-md" :
                      pastDate || todayAfter18 ?
                          "text-gray-500 cursor-not-allowed bg-black/20" :
                        todayClass ?
                            "bg-gradient-to-br from-orange-500/40 to-red-500/40 text-orange-200 border-2 border-orange-400/50 shadow-lg shadow-orange-500/20 hover:scale-105" :
                            "text-white bg-black/40 hover:bg-gradient-to-br hover:from-orange-500/30 hover:to-red-500/30 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 border border-orange-500/20 hover:border-orange-400/40"
                    }`}>
                  <span className="relative z-10">{day}</span>

                  {/* Indicador de reservas */}
                  {reservasCount > 0 && !pastDate && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg animate-pulse z-20 border border-red-400/50">
                      {reservasCount}
                    </div>
                  )}

                  {/* Efecto hover */}
                  {!pastDate && !todayAfter18 && !isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/20 group-hover:to-red-500/10 transition-all duration-300 rounded-xl" />
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
          {/* Fondo con imagen */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <Image
              src="/FONDOS-01.webp"
              alt="Eleven Club background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-red-900/40"></div>
          </div>

          <Card className="relative overflow-hidden bg-transparent border-orange-500/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="relative z-10 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-orange-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo pequeño */}
                  <Image
                    src="/logo-eleven.webp"
                    alt="Eleven Club"
                    width={40}
                    height={40}
                    className="opacity-90"
                  />
                  <div>
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-legquinne font-normal">
                      <div className="p-2 bg-red-500/20 rounded-lg border border-red-400/30">
                        <Clock className="w-6 h-6 text-red-300" />
              </div>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
                      {loadingDay && <Loader2 className="w-5 h-5 animate-spin text-red-400" />}
            </CardTitle>
                  </div>
                </div>
                {/* Elemento decorativo */}
                <Image
                  src="/detalle-texto-eleven.webp"
                  alt="Eleven Club detail"
                  width={100}
                  height={30}
                  className="opacity-40 hidden md:block"
                />
              </div>
          </CardHeader>
            <CardContent className="p-6 relative z-10">
            {loadingDay ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-4" />
                    <span className="text-white/80 text-lg">Cargando disponibilidad...</span>
                  </div>
              </div>
            ) : reservasDelDia.length === 0 ? (
              <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
                    <Calendar className="w-10 h-10 text-orange-400" />
                  </div>
                  <p className="text-white/80 text-lg font-legquinne">No hay reservas para esta fecha</p>
                  <p className="text-white/60 text-sm mt-2">¡Perfecto para nuevas reservas!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Info para usuarios no admin */}
                {!isAdmin && (
                    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-orange-200 flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                      <span><strong>Info:</strong> El local tiene 50 mesas totales para todo el día.
                      Cada 4 personas ocupan 1 mesa.</span>
                    </div>
                  </div>
                )}

                {/* Disponibilidad por horario */}
                <div>
                    <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2 font-legquinne">
                      <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    Disponibilidad por horario
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {horarios.map((horario) => {
                      const disponibles = disponibilidadPorHorario[horario] ?? "-"
                      const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
                      const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)
                      const ocupacion = typeof disponibles === "number" ? ((50 - disponibles) / 50) * 100 : 0

                      return (
                          <div key={horario} className="bg-black/60 rounded-xl p-4 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-bold text-lg">{horario}</span>
                            <Badge
                              variant={disponibles > 30 ? "default" : disponibles > 15 ? "secondary" : "destructive"}
                              className={`text-xs font-semibold px-3 py-1 ${
                                disponibles > 30 ? "bg-green-500/20 text-green-300 border-green-500/30" :
                                disponibles > 15 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                                "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}
                            >
                              {disponibles}/50 libres
                            </Badge>
                          </div>

                          {/* Barra de ocupación */}
                            <div className="w-full bg-black/40 rounded-full h-2 mb-3 overflow-hidden border border-orange-500/20">
                            <div
                              className={`h-full transition-all duration-500 ${
                                ocupacion > 70 ? "bg-gradient-to-r from-red-500 to-red-600" :
                                ocupacion > 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                                "bg-gradient-to-r from-green-500 to-green-600"
                              }`}
                              style={{ width: `${ocupacion}%` }}
                            />
                          </div>

                          {reservasEnHorario.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-orange-400" />
                                  <span className="text-orange-300 font-medium">
                                  {reservasEnHorario.length} reserva{reservasEnHorario.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                                <div className="text-sm text-white/80">
                                <strong>{personasEnHorario}</strong> personas total
                              </div>
                            </div>
                          ) : (
                              <div className="flex items-center gap-2 text-sm text-white/50">
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
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
                      <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2 font-legquinne">
                        <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                      Reservas del día
                    </h4>
                    <div className="space-y-4">
                      {reservasDelDia.map((reserva, index) => (
                          <div key={reserva.id} className="bg-black/60 rounded-xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 group backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                                    <User className="w-5 h-5 text-orange-300" />
                                </div>
                                <h5 className="text-white font-bold text-lg">{reserva.nombre}</h5>
                                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                  #{index + 1}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 mb-4">
                                  <div className="flex items-center gap-2 text-white/80">
                                    <Phone className="w-4 h-4 text-orange-400" />
                                  <span className="font-medium">{reserva.contacto}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-2 text-orange-300 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-bold">{reserva.horario}</span>
                                </div>
                                  <div className="flex items-center gap-2 text-red-300 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                  <Users className="w-4 h-4" />
                                  <span className="font-bold">{reserva.cantidad_personas} personas</span>
                                </div>
                                  <Badge variant="outline" className="border-orange-500/50 text-orange-300 bg-orange-500/10 font-semibold">
                                  {Math.ceil(reserva.cantidad_personas / 4)} mesa{Math.ceil(reserva.cantidad_personas / 4) !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>

                            <div className="ml-6">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                      className="border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gradient-to-br from-black/95 to-gray-900/95 border-orange-500/30 backdrop-blur-xl">
                                  <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white text-xl font-legquinne">¿Eliminar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-white/80 text-base">
                                        ¿Estás seguro de que quieres eliminar la reserva de <strong className="text-orange-300">{reserva.nombre}</strong>?
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-black/60 text-white border-orange-500/30 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteReserva(reserva.id, reserva.nombre)}
                                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/30"
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
