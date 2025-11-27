'use client'

import ContadorConfirmacion from '@/components/ContadorConfirmacion'
import ReservationCalendarAdmin from '@/components/ReservationCalendarAdmin'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deleteReserva, getContador } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  Loader2,
  LogOut,
  MessageSquare,
  Phone,
  Plus,
  Search,
  TableIcon,
  Trash2,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { AdminData, PlazasStats, MenuItem, Category } from '@/types'

const chartColors = {
  primary: '#F97316',
  secondary: '#FED7AA',
  accent: '#EA580C',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#64748B',
}

const RESERVAS_PER_PAGE = 25
const RESERVAS_CACHE_KEY = 'admin_reservas_cache'

// Función auxiliar para calcular estadísticas completas
const calcularEstadisticasCompletas = async (
  local_id: string,
  fecha: string
): Promise<PlazasStats> => {
  try {
    const LIMITE_POR_TURNO = 30
    const NUM_TURNOS = 2
    const PLAZAS_TOTALES = LIMITE_POR_TURNO * NUM_TURNOS

    const { data: reservasDelDia } = await supabase
      .from('reservas')
      .select('horario, cantidad_personas')
      .eq('local_id', local_id)
      .eq('fecha', fecha)

    const reservasPrimerTurno = (reservasDelDia || []).filter(
      (r) => r.horario === '20:15'
    )
    const reservasSegundoTurno = (reservasDelDia || []).filter(
      (r) => r.horario === '22:30'
    )

    const personasPrimerTurno = reservasPrimerTurno.reduce(
      (acc, r) => acc + r.cantidad_personas,
      0
    )
    const personasSegundoTurno = reservasSegundoTurno.reduce(
      (acc, r) => acc + r.cantidad_personas,
      0
    )
    const personasTotales = personasPrimerTurno + personasSegundoTurno
    const plazasOcupadas = personasTotales

    return {
      plazasTotales: PLAZAS_TOTALES,
      plazasOcupadas,
      plazasDisponibles: Math.max(0, PLAZAS_TOTALES - plazasOcupadas),
      personasTotales,
      primerTurno: {
        limite: 30,
        ocupadas: personasPrimerTurno,
        disponibles: Math.max(0, 30 - personasPrimerTurno),
      },
      segundoTurno: {
        limite: 30,
        ocupadas: personasSegundoTurno,
        disponibles: Math.max(0, 30 - personasSegundoTurno),
      },
    }
  } catch (error) {
    console.error('Error al calcular estadísticas:', error)
    return {
      plazasTotales: 60,
      plazasOcupadas: 0,
      plazasDisponibles: 60,
      personasTotales: 0,
      primerTurno: { limite: 30, ocupadas: 0, disponibles: 30 },
      segundoTurno: { limite: 30, ocupadas: 0, disponibles: 30 },
    }
  }
}

// OPTIMIZACIÓN: Componente memoizado para filas de reservas
const ReservaRow = memo(
  ({
    reserva,
    index,
    onEdit,
    onDelete,
    formatDate,
    getStatusBadge,
    truncateEmail,
    copyToClipboard,
  }: {
    reserva: any
    index: number
    onEdit: (reserva: any) => void
    onDelete: (id: string, nombre: string) => void
    formatDate: (date: string) => string
    getStatusBadge: (fecha: string, horario: string) => React.ReactElement
    truncateEmail: (email: string, maxLength?: number) => string
    copyToClipboard: (text: string) => void
  }) => {
    return (
      <TableRow className="border-amber-500/10 hover:bg-amber-500/5 transition-colors">
        <TableCell className="py-3">
          {getStatusBadge(reserva.fecha, reserva.horario)}
        </TableCell>
        <TableCell className="text-amber-100 py-3">
          <div className="font-medium text-sm">{formatDate(reserva.fecha)}</div>
        </TableCell>
        <TableCell className="text-amber-100 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-sm">{reserva.horario}</span>
          </div>
        </TableCell>
        <TableCell className="text-white py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium text-sm">{reserva.nombre}</span>
          </div>
        </TableCell>
        <TableCell className="text-amber-100 py-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer truncate hover:text-amber-200 transition-colors text-xs">
                    {truncateEmail(reserva.email || reserva.contacto, 20)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{reserva.email || reserva.contacto}</p>
                </TooltipContent>
              </Tooltip>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(reserva.email || reserva.contacto)
                }
                className="h-5 w-5 p-0 hover:bg-amber-500/20 flex-shrink-0"
              >
                <Copy className="w-2.5 h-2.5 text-amber-400 hover:text-amber-200" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-xs truncate">
                {reserva.whatsapp || reserva.contacto}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-amber-100 py-3">
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs">
            <Users className="w-3 h-3 mr-1" />
            {reserva.cantidad_personas}
          </Badge>
        </TableCell>
        <TableCell className="text-amber-100 max-w-48 py-3">
          {reserva.notas ? (
            <p className="text-xs text-amber-200 line-clamp-2">
              {reserva.notas}
            </p>
          ) : (
            <span className="text-amber-500/50 text-xs italic">Sin notas</span>
          )}
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="flex gap-1 justify-center">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              onClick={() => onEdit(reserva)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-amber-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white font-legquinne">
                    ¿Eliminar reserva?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-amber-300/70">
                    ¿Estás seguro de que quieres eliminar la reserva de{' '}
                    <strong className="text-amber-200">{reserva.nombre}</strong>
                    ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-700 text-white border-amber-500/30 hover:bg-slate-600">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(reserva.id, reserva.nombre)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    )
  }
)

ReservaRow.displayName = 'ReservaRow'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [allReservas, setAllReservas] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreReservas, setHasMoreReservas] = useState(false)
  const [personasActuales, setPersonasActuales] = useState<number>(0)
  const [plazasStats, setPlazasStats] = useState<PlazasStats>({
    plazasTotales: 60,
    plazasOcupadas: 0,
    plazasDisponibles: 60,
    personasTotales: 0,
    primerTurno: { limite: 30, ocupadas: 0, disponibles: 30 },
    segundoTurno: { limite: 30, ocupadas: 0, disponibles: 30 },
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Carta states
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

  const router = useRouter()

  // Missing state variables
  const [reservaData, setReservaData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    contacto: '',
    fecha: '',
    horario: '',
    cantidad_personas: 1,
    quiere_newsletter: false,
    notas: ''
  })
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    reservasConNotas: 0,
    statusDistribution: {
      confirmadas: 0,
      pendientes: 0,
      canceladas: 0,
      hoy: 0,
      proximas: 0
    },
    totalPersonas: 0,
    horarioPopular: {
      horario: '',
      count: 0,
      cantidad: 0
    }
  })
  const [reservas, setReservas] = useState<any[]>([])

  // Missing handler functions
  const handleSaveMenuItem = useCallback(async (itemData: any) => {
    // Implement your save menu item logic here
  }, [])

  const handleDeleteMenuItem = useCallback(async (id: string) => {
    // Implement your delete menu item logic here
  }, [])

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Callbacks memoizados
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const getStatus = useCallback((fecha: string, horario: string) => {
    const reservaDateTime = new Date(`${fecha}T${horario}`)
    const now = new Date()
    const reservaDate = new Date(reservaDateTime)
    reservaDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reservaDate < today) return 'Pasada'
    if (reservaDate > today) return 'Próxima'
    if (reservaDateTime < now) return 'Pasada'
    return 'Hoy'
  }, [])

  const getStatusBadge = useCallback(
    (fecha: string, horario: string) => {
      const status = getStatus(fecha, horario)
      switch (status) {
        case 'Pasada':
          return (
            <Badge
              variant="secondary"
              className="bg-slate-600 text-slate-200 text-xs"
            >
              Pasada
            </Badge>
          )
        case 'Hoy':
          return (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              Hoy
            </Badge>
          )
        case 'Próxima':
          return (
            <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              Próxima
            </Badge>
          )
        default:
          return (
            <Badge variant="secondary" className="text-xs">
              Pasada
            </Badge>
          )
      }
    },
    [getStatus]
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('¡Copiado!', { duration: 1500 })
    } catch (err) {
      toast.error('Error al copiar')
    }
  }, [])

  const truncateEmail = useCallback((email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email
    return email.substring(0, maxLength) + '...'
  }, [])

  const handleLogout = useCallback(async () => {
    if (adminData?.id) {
      await supabase
        .from('usuarios_admin')
        .update({ token_acceso: null })
        .eq('id', adminData.id)
    }
    localStorage.removeItem('admin_session')
    localStorage.removeItem(RESERVAS_CACHE_KEY)
    router.push('/admin/login')
  }, [adminData?.id, router])

  // Cargar más reservas
  const loadMoreReservas = useCallback(async () => {
    if (!adminData?.local_id) return

    try {
      const offset = currentPage * RESERVAS_PER_PAGE
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('local_id', adminData.local_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + RESERVAS_PER_PAGE - 1)

      if (error) throw error

      if (data && data.length > 0) {
        const newReservas = [...allReservas, ...data]
        setAllReservas(newReservas)
        setCurrentPage((prev) => prev + 1)
        setHasMoreReservas(data.length === RESERVAS_PER_PAGE)

        // Guardar en localStorage
        localStorage.setItem(RESERVAS_CACHE_KEY, JSON.stringify(newReservas))
        toast.success(`${data.length} reservas más cargadas`)
      } else {
        setHasMoreReservas(false)
        toast.info('No hay más reservas')
      }
    } catch (error) {
      console.error('Error loading more reservas:', error)
      toast.error('Error al cargar más reservas')
    }
  }, [adminData?.local_id, currentPage, allReservas])

  // Handlers para contador
  const handleUpdateContador = useCallback(
    async (increment: boolean) => {
      if (!adminData?.local_id) return
      const nuevoValor = Math.max(0, personasActuales + (increment ? 1 : -1))
      setPersonasActuales(nuevoValor)

      try {
        const today = new Date().toISOString().split('T')[0]
        const { error } = await supabase.from('contador_personas').upsert(
          {
            local_id: adminData.local_id,
            fecha: today,
            cantidad: nuevoValor,
          },
          { onConflict: 'local_id,fecha' }
        )

        if (error) {
          setPersonasActuales(personasActuales)
          toast.error('Error al actualizar el contador')
        }
      } catch (error) {
        setPersonasActuales(personasActuales)
        toast.error('Error al actualizar el contador')
      }
    },
    [adminData?.local_id, personasActuales]
  )

  const handleBulkUpdateContador = useCallback(
    async (changes: number) => {
      if (!adminData?.local_id) return
      const nuevoValor = Math.max(0, personasActuales + changes)
      setPersonasActuales(nuevoValor)

      try {
        const today = new Date().toISOString().split('T')[0]
        const { error } = await supabase.from('contador_personas').upsert(
          {
            local_id: adminData.local_id,
            fecha: today,
            cantidad: nuevoValor,
          },
          { onConflict: 'local_id,fecha' }
        )

        if (error) {
          setPersonasActuales(personasActuales)
          toast.error('Error al actualizar el contador')
        }
      } catch (error) {
        setPersonasActuales(personasActuales)
        toast.error('Error al actualizar el contador')
      }
    },
    [adminData?.local_id, personasActuales]
  )

  const handleResetContador = useCallback(async () => {
    if (!adminData?.local_id) return
    setPersonasActuales(0)

    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase.from('contador_personas').upsert(
        {
          local_id: adminData.local_id,
          fecha: today,
          cantidad: 0,
        },
        { onConflict: 'local_id,fecha' }
      )

      if (error) toast.error('Error al resetear el contador')
    } catch (error) {
      toast.error('Error al resetear el contador')
    }
  }, [adminData?.local_id])

  const handleDeleteReserva = useCallback(
    async (id: string, nombre: string) => {
      const success = await deleteReserva(id)
      if (success) {
        setAllReservas((prev) => prev.filter((r) => r.id !== id))
        if (adminData?.local_id) {
          const today = new Date().toISOString().split('T')[0]
          const stats = await calcularEstadisticasCompletas(
            adminData.local_id,
            today
          )
          setPlazasStats(stats)
        }
        toast.success(`Reserva de ${nombre} eliminada`)
      } else {
        toast.error('Error al eliminar la reserva')
      }
    },
    [adminData?.local_id]
  )

  // Carta handlers
  const loadCarta = useCallback(async () => {
    if (!adminData?.local_id) return

    try {
      const { data: categoriasData } = await supabase
        .from('categorias_carta')
        .select('*')
        .eq('local_id', adminData.local_id)
        .order('orden', { ascending: true })

      const { data: itemsData } = await supabase
        .from('items_carta')
        .select('*')
        .eq('local_id', adminData.local_id)
        .order('orden', { ascending: true })

      setCategories(categoriasData || [])
      setMenuItems(itemsData || [])
    } catch (error) {
      console.error('Error loading carta:', error)
      toast.error('Error al cargar la carta')
    }
  }, [adminData?.local_id])

  const handleSaveCategory = useCallback(
    async (nombre: string) => {
      if (!adminData?.local_id) return

    if (reservaData.cantidad_personas > 6) {
      toast.error("El máximo de personas por reserva es 6. Para más personas, contactar al: 0223-5357224")
      return
    }

    try {
      const { error } = await supabase
        .from("reservas")
        .update({
          nombre: reservaData.nombre,
          email: reservaData.email,
          whatsapp: reservaData.whatsapp,
          contacto: reservaData.email || reservaData.contacto, // Mantener compatibilidad
          fecha: reservaData.fecha,
          horario: reservaData.horario,
          cantidad_personas: reservaData.cantidad_personas,
          quiere_newsletter: reservaData.quiere_newsletter || false,
          notas: reservaData.notas
        })
        .eq("id", editingReserva.id)
        .eq("local_id", adminData.local_id)

      if (error) {
        console.error("Error al actualizar reserva:", error)
        toast.error("Error al actualizar la reserva")
        return
      }

      const { data: reservasData } = await supabase
        .from("reservas")
        .select("*")
        .eq("local_id", adminData.local_id)

      setReservas(reservasData || [])
      setIsEditDialogOpen(false)
      setEditingReserva(null)

      toast.success("Reserva actualizada correctamente")
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      toast.error("Error al actualizar la reserva")
    }
  }, [allReservas, getStatus])

  const chartData = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const reservasDelDia = allReservas.filter((r) => r.fecha === dateStr)
      const personasDelDia = reservasDelDia.reduce(
        (acc, r) => acc + r.cantidad_personas,
        0
      )

      return {
        fecha: date.toLocaleDateString('es-AR', {
          month: 'short',
          day: 'numeric',
        }),
        reservas: reservasDelDia.length,
        personas: personasDelDia,
      }
    }).reverse()
  }, [allReservas])

  const turnosData = useMemo(
    () => [
      {
        name: '20:15',
        value: plazasStats.primerTurno.ocupadas || 0,
        total: plazasStats.primerTurno.limite || 30,
        color: chartColors.primary,
      },
      {
        name: '22:30',
        value: plazasStats.segundoTurno.ocupadas || 0,
        total: plazasStats.segundoTurno.limite || 30,
        color: chartColors.accent,
      },
    ],
    [plazasStats]
  )

  const statusData = useMemo(
    () => [
      {
        name: 'Hoy',
        value: analyticsData.statusDistribution.hoy,
        color: chartColors.success,
      },
      {
        name: 'Próximas',
        value: analyticsData.statusDistribution.proximas,
        color: chartColors.warning,
      },
    ],
    [analyticsData.statusDistribution]
  )

  const filteredReservas = useMemo(() => {
    if (!debouncedSearchTerm) return allReservas

    return allReservas.filter((reserva) =>
      reserva.nombre.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [allReservas, debouncedSearchTerm])

  // Verificar autenticación
  useEffect(() => {
    const verificarAutenticacion = async () => {
      const sessionDataString = localStorage.getItem('admin_session')

      if (!sessionDataString) {
        router.replace('/admin/login')
        return
      }

      try {
        const sessionData = JSON.parse(sessionDataString)
        const now = Date.now()

        if (now > sessionData.expires) {
          localStorage.removeItem('admin_session')
          router.replace('/admin/login')
          return
        }

        const { data: adminDbData, error } = await supabase
          .from('usuarios_admin')
          .select('id, nombre, user, local_id, token_acceso')
          .eq('id', sessionData.user.id)
          .eq('token_acceso', sessionData.token)
          .single()

        if (error || !adminDbData) {
          localStorage.removeItem('admin_session')
          router.replace('/admin/login')
          return
        }

        setAdminData(sessionData.user)
      } catch (error) {
        localStorage.removeItem('admin_session')
        router.replace('/admin/login')
      }
    }

    verificarAutenticacion()
  }, [router])

  // Cargar datos iniciales
  useEffect(() => {
    if (!adminData?.local_id) return

    const cargarDatos = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Intentar cargar desde cache primero
        const cachedReservas = localStorage.getItem(RESERVAS_CACHE_KEY)
        let initialReservas: any[] = []

        if (cachedReservas) {
          try {
            initialReservas = JSON.parse(cachedReservas)
            setAllReservas(initialReservas)
          } catch (e) {
            console.error('Error parsing cached reservas:', e)
          }
        }

        // Cargar las últimas 25 reservas
        const [reservasResult, contadorData, stats] = await Promise.all([
          supabase
            .from('reservas')
            .select('*')
            .eq('local_id', adminData.local_id)
            .order('created_at', { ascending: false })
            .limit(RESERVAS_PER_PAGE),
          getContador(adminData.local_id),
          calcularEstadisticasCompletas(adminData.local_id, today),
        ])

        const newReservas = reservasResult.data || []
        setAllReservas(newReservas)
        setCurrentPage(1)
        setHasMoreReservas(newReservas.length === RESERVAS_PER_PAGE)
        setPersonasActuales(contadorData)
        setPlazasStats(stats)

        // Guardar en cache
        localStorage.setItem(RESERVAS_CACHE_KEY, JSON.stringify(newReservas))
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
    loadCarta()
  }, [adminData, loadCarta])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Image
            src="/logo-eleven.webp"
            alt="Eleven Club"
            width={80}
            height={80}
            className="mx-auto opacity-80"
          />
          <div className="flex items-center gap-3 text-amber-100">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-legquinne text-xl">Cargando...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[url('/FONDOS-01.webp')] bg-cover bg-center opacity-3 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-amber-500/8 via-slate-900/50 to-orange-500/8 pointer-events-none" />

        {/* Header - Simplified */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-xl border-b border-amber-500/20 sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-eleven.webp"
                  alt="Eleven Club"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-xl font-legquinne text-amber-100 font-bold">
                    Dashboard
                  </h1>
                  <p className="text-amber-300/70 text-xs">
                    {adminData?.nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-3 py-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-300 text-xs font-medium">
                    {personasActuales} en vivo
                  </span>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto p-4 space-y-6">
          {/* Quick Stats - Compact */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-300 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Personas en Vivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-legquinne font-bold text-white mb-2">
                  {personasActuales}
                </div>
                <ContadorConfirmacion
                  personasActuales={personasActuales}
                  onIncrementAction={() => handleUpdateContador(true)}
                  onDecrementAction={() => handleUpdateContador(false)}
                  onResetAction={handleResetContador}
                  onBulkUpdateAction={handleBulkUpdateContador}
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 border-emerald-500/30 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ocupación Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-legquinne font-bold text-white mb-2">
                  {Math.round(
                    (plazasStats.plazasOcupadas / plazasStats.plazasTotales) *
                      100
                  )}
                  %
                </div>
                <Progress
                  value={
                    (plazasStats.plazasOcupadas / plazasStats.plazasTotales) *
                    100
                  }
                  className="h-2 bg-slate-700"
                />
                <div className="text-xs text-emerald-200 mt-1">
                  {plazasStats.plazasOcupadas}/{plazasStats.plazasTotales}{' '}
                  plazas
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 border-blue-500/30 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Total Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-legquinne font-bold text-white mb-2">
                  {allReservas.length}
                </div>
                <div className="text-xs text-blue-200">
                  {analyticsData.totalPersonas} personas totales
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Tabs - AT THE TOP */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="reservas" className="space-y-4">
              <TabsList className="bg-slate-800/70 border border-amber-500/20 backdrop-blur-xl p-1">
                <TabsTrigger
                  value="reservas"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne text-sm"
                >
                  <TableIcon className="w-4 h-4 mr-2" />
                  Reservas
                </TabsTrigger>
                <TabsTrigger
                  value="calendario"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne text-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger
                  value="carta"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne text-sm"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Carta
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Análisis
                </TabsTrigger>
              </TabsList>

              {/* RESERVAS TAB */}
              <TabsContent value="reservas" className="space-y-0">
                <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
                  <CardHeader className="border-b border-amber-500/20 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-amber-100 font-legquinne text-lg">
                          Gestión de Reservas
                        </CardTitle>
                        <CardDescription className="text-amber-300/70 text-sm">
                          Mostrando {filteredReservas.length} reservas
                        </CardDescription>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-48 bg-slate-700/50 border-amber-500/30 text-amber-100 text-sm"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredReservas.length === 0 ? (
                      <div className="text-center py-12 text-amber-300/70">
                        <Calendar className="w-16 h-16 mx-auto opacity-30 mb-3" />
                        <p className="text-lg font-legquinne">
                          No hay reservas
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto max-h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-amber-500/20">
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Estado
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Fecha
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Horario
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Cliente
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Contacto
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Personas
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs">
                                  Notas
                                </TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-xs text-center">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredReservas.map((r, index) => (
                                <ReservaRow
                                  key={r.id}
                                  reserva={r}
                                  index={index}
                                  onEdit={() => {}}
                                  onDelete={handleDeleteReserva}
                                  formatDate={formatDate}
                                  getStatusBadge={getStatusBadge}
                                  truncateEmail={truncateEmail}
                                  copyToClipboard={copyToClipboard}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        {hasMoreReservas && (
                          <div className="border-t border-amber-500/20 p-4 text-center">
                            <Button
                              onClick={loadMoreReservas}
                              variant="outline"
                              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                            >
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Cargar 25 más
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CALENDARIO TAB */}
              <TabsContent value="calendario">
                {adminData?.local_id ? (
                  <div className="bg-slate-800/70 border border-amber-500/30 backdrop-blur-xl rounded-lg p-4">
                    <ReservationCalendarAdmin localId={adminData.local_id} />
                  </div>
                ) : (
                  <Card className="bg-slate-800/70 border-amber-500/30">
                    <CardContent className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* CARTA TAB */}
              <TabsContent value="carta">
                <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
                  <CardHeader className="border-b border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-amber-100 font-legquinne text-lg">
                          Gestión de Carta
                        </CardTitle>
                        <CardDescription className="text-amber-300/70 text-sm">
                          Administra el menú del local
                        </CardDescription>
                      </div>
                      <Dialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Categoría
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-amber-500/20">
                          <DialogHeader>
                            <DialogTitle className="text-white font-legquinne">
                              Nueva Categoría
                            </DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              const formData = new FormData(e.currentTarget)
                              handleSaveCategory(
                                formData.get('nombre') as string
                              )
                            }}
                          >
                            <div className="space-y-4">
                              <div>
                                <Label
                                  htmlFor="nombre"
                                  className="text-amber-200"
                                >
                                  Nombre
                                </Label>
                                <Input
                                  id="nombre"
                                  name="nombre"
                                  required
                                  className="bg-slate-700 border-amber-500/30 text-white"
                                  placeholder="Ej: Cocktails de firma"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                              >
                                Crear Categoría
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Categories List */}
                      <div className="md:col-span-1 space-y-2">
                        <h3 className="text-sm font-semibold text-amber-300 mb-3">
                          Categorías
                        </h3>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === cat.id
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-700/50 text-amber-200 hover:bg-slate-700'
                            }`}
                          >
                            {cat.nombre}
                          </button>
                        ))}
                      </div>

                      {/* Items List */}
                      <div className="md:col-span-3">
                        {selectedCategory ? (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold text-amber-300">
                                Items -{' '}
                                {
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.nombre
                                }
                              </h3>
                              <Dialog
                                open={isItemDialogOpen}
                                onOpenChange={setIsItemDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => setEditingItem(null)}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Nuevo Item
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-amber-500/20">
                                  <DialogHeader>
                                    <DialogTitle className="text-white font-legquinne">
                                      {editingItem
                                        ? 'Editar Item'
                                        : 'Nuevo Item'}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault()
                                      const formData = new FormData(
                                        e.currentTarget
                                      )
                                      handleSaveMenuItem({
                                        nombre: formData.get(
                                          'nombre'
                                        ) as string,
                                        descripcion: formData.get(
                                          'descripcion'
                                        ) as string,
                                        precio: parseFloat(
                                          formData.get('precio') as string
                                        ),
                                        disponible: true,
                                      })
                                    }}
                                  >
                                    <div className="space-y-4">
                                      <div>
                                        <Label
                                          htmlFor="nombre"
                                          className="text-amber-200"
                                        >
                                          Nombre
                                        </Label>
                                        <Input
                                          id="nombre"
                                          name="nombre"
                                          defaultValue={editingItem?.nombre}
                                          required
                                          className="bg-slate-700 border-amber-500/30 text-white"
                                        />
                                      </div>
                                      <div>
                                        <Label
                                          htmlFor="descripcion"
                                          className="text-amber-200"
                                        >
                                          Descripción
                                        </Label>
                                        <Textarea
                                          id="descripcion"
                                          name="descripcion"
                                          defaultValue={
                                            editingItem?.descripcion || ''
                                          }
                                          className="bg-slate-700 border-amber-500/30 text-white"
                                          rows={3}
                                        />
                                      </div>
                                      <div>
                                        <Label
                                          htmlFor="precio"
                                          className="text-amber-200"
                                        >
                                          Precio
                                        </Label>
                                        <Input
                                          id="precio"
                                          name="precio"
                                          type="number"
                                          step="0.01"
                                          defaultValue={editingItem?.precio}
                                          required
                                          className="bg-slate-700 border-amber-500/30 text-white"
                                        />
                                      </div>
                                      <Button
                                        type="submit"
                                        className="w-full bg-amber-600 hover:bg-amber-700"
                                      >
                                        {editingItem ? 'Actualizar' : 'Crear'}{' '}
                                        Item
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <div className="space-y-2">
                              {menuItems
                                .filter(
                                  (item) =>
                                    item.categoria_id === selectedCategory
                                )
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-slate-700/50 rounded-lg p-3 flex items-start justify-between hover:bg-slate-700 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <h4 className="text-white font-medium text-sm">
                                        {item.nombre}
                                      </h4>
                                      {item.descripcion && (
                                        <p className="text-amber-200/70 text-xs mt-1">
                                          {item.descripcion}
                                        </p>
                                      )}
                                      <p className="text-emerald-400 font-semibold text-sm mt-1">
                                        ${item.precio.toLocaleString('es-AR')}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/20"
                                        onClick={() => {
                                          setEditingItem(item)
                                          setIsItemDialogOpen(true)
                                        }}
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/20"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-slate-800 border-amber-500/20">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">
                                              ¿Eliminar item?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-amber-300/70">
                                              ¿Estás seguro de eliminar "
                                              {item.nombre}"?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-slate-700 text-white">
                                              Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDeleteMenuItem(item.id)
                                              }
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Eliminar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 text-amber-300/70">
                            <UtensilsCrossed className="w-16 h-16 mx-auto opacity-30 mb-3" />
                            <p className="text-sm">
                              Selecciona una categoría para ver sus items
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Charts */}
                  <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-amber-100 font-legquinne text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        Tendencia Semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          reservas: {
                            label: 'Reservas',
                            color: chartColors.primary,
                          },
                        }}
                        className="h-[250px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="reservas"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={chartColors.primary}
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={chartColors.primary}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="fecha"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#FED7AA', fontSize: 11 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#FED7AA', fontSize: 11 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="reservas"
                              stroke={chartColors.primary}
                              fillOpacity={1}
                              fill="url(#reservas)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-amber-100 font-legquinne text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Distribución por Turno
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: 'Ocupadas',
                            color: chartColors.primary,
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={turnosData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {turnosData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {turnosData.map((turno, index) => (
                          <div key={index} className="text-center">
                            <div className="text-base font-legquinne text-white">
                              {turno.name}
                            </div>
                            <div className="text-xs text-amber-200">
                              {turno.value}/{turno.total}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-800/70 border-emerald-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-emerald-300 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Promedio/Reserva
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-legquinne font-bold text-white">
                        {allReservas.length > 0
                          ? (
                              allReservas.reduce(
                                (acc, r) => acc + r.cantidad_personas,
                                0
                              ) / allReservas.length
                            ).toFixed(1)
                          : '0.0'}
                      </div>
                      <p className="text-xs text-emerald-300/70 mt-1">
                        personas
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-amber-300 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Horario Popular
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-legquinne font-bold text-white">
                        {analyticsData.horarioPopular.horario}
                      </div>
                      <p className="text-xs text-amber-300/70 mt-1">
                        {analyticsData.horarioPopular.cantidad} reservas
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-blue-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-blue-300 flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" />
                        Tasa Ocupación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-legquinne font-bold text-white">
                        {Math.round(
                          (plazasStats.plazasOcupadas /
                            plazasStats.plazasTotales) *
                            100
                        )}
                        %
                      </div>
                      <Progress
                        value={
                          (plazasStats.plazasOcupadas /
                            plazasStats.plazasTotales) *
                          100
                        }
                        className="h-1.5 mt-2 bg-slate-700"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-purple-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-purple-300 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Con Notas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-legquinne font-bold text-white">
                        {analyticsData.reservasConNotas}
                      </div>
                      <p className="text-xs text-purple-300/70 mt-1">
                        {allReservas.length > 0
                          ? Math.round(
                              (analyticsData.reservasConNotas /
                                allReservas.length) *
                                100
                            )
                          : 0}
                        % del total
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}
