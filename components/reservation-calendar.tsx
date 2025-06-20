"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Trash2, Phone, User, Loader2 } from "lucide-react"
import { getReservas, getDisponibilidad, deleteReserva, type Reserva } from "@/lib/storage"

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
    <div className="space-y-6">
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario de Reservas
            {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
          </CardTitle>
          <CardDescription className="text-gray-300">
            Selecciona una fecha para ver disponibilidad{isAdmin ? " y reservas" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} 
              className="bg-gray-700/80 border-purple-500/50 text-purple-200 hover:bg-purple-600/20 hover:border-purple-400 hover:text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} 
              className="bg-gray-700/80 border-purple-500/50 text-purple-200 hover:bg-purple-600/20 hover:border-purple-400 hover:text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              disabled={loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="h-12" />
              const dateStr = formatDateString(day)
              const reservasCount = reservasPorDia[dateStr] || 0
              const isSelected = selectedDate === dateStr
              const todayClass = isToday(day)
              const pastDate = isPastDate(day)
              const todayAfter18 = isTodayAfter18(day)
              
              // Debug temporal para verificar fechas
              if (todayClass) {
                console.log(`📅 Debug fecha HOY (${day}):`, {
                  dateStr,
                  isToday: todayClass,
                  isPast: pastDate,
                  todayAfter18,
                  disabled: pastDate || todayAfter18 || loading
                })
              }

              return (
                <button
                  key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                  onClick={() => setSelectedDate(dateStr)}
                  disabled={pastDate || todayAfter18 || loading}
                  className={`h-12 rounded-lg text-sm font-medium transition-all relative
                    ${isSelected ? "bg-purple-600 text-white" :
                      pastDate || todayAfter18 ? "text-gray-500 cursor-not-allowed" :
                        todayClass ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" :
                          "text-white hover:bg-gray-700"}`}>
                  {day}
                  {reservasCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white">
                      {reservasCount}
                    </div>
                  )}
                  {todayAfter18 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
              {loadingDay && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDay ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="ml-2 text-gray-400">Cargando disponibilidad...</span>
              </div>
            ) : reservasDelDia.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay reservas para esta fecha</p>
            ) : (
              <div className="space-y-4">
                {!isAdmin && (
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
                    <div className="text-blue-300 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span><strong>Info:</strong> El local tiene 50 mesas totales para todo el día. 
                      Cada 4 personas ocupan 1 mesa.</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-white font-semibold mb-3">Disponibilidad por horario:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {horarios.map((horario) => {
                      const disponibles = disponibilidadPorHorario[horario] ?? "-"
                      const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
                      const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)

                      return (
                        <div key={horario} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{horario}</span>
                            <Badge variant={disponibles > 30 ? "default" : disponibles > 15 ? "secondary" : "destructive"} className="text-xs">
                              {disponibles}/50 libres
                            </Badge>
                          </div>
                          {reservasEnHorario.length > 0 ? (
                            <div className="space-y-1">
                              <div className="text-xs text-purple-300">
                                {reservasEnHorario.length} reserva{reservasEnHorario.length !== 1 ? "s" : ""}
                              </div>
                              {isAdmin ? (
                                <div className="text-xs text-gray-400">
                                  {personasEnHorario} personas
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  {personasEnHorario} personas
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Sin reservas</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Reservas del día:</h4>
                    <div className="space-y-3">
                      {reservasDelDia.map((reserva) => (
                        <div key={reserva.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <h5 className="text-white font-medium">{reserva.nombre}</h5>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-400 text-sm">{reserva.contacto}</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-purple-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">{reserva.horario}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Users className="w-4 h-4" />
                                  <span>{reserva.cantidad_personas} personas</span>
                                </div>
                                <Badge variant="outline" className="border-purple-500 text-purple-300 text-xs">
                                  {Math.ceil(reserva.cantidad_personas / 4)} mesa{Math.ceil(reserva.cantidad_personas / 4) !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>
                            <div className="ml-4">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-800 border-gray-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">¿Eliminar reserva?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-300">
                                      ¿Estás seguro de que quieres eliminar la reserva de <strong>{reserva.nombre}</strong>? 
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteReserva(reserva.id, reserva.nombre)}
                                      className="bg-red-600 hover:bg-red-700"
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
      )}
    </div>
  )
}
