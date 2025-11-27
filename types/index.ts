interface AdminData {
  id: string
  nombre: string
  user: string
  local_id: string
}

interface PlazasStats {
  plazasTotales: number
  plazasOcupadas: number
  plazasDisponibles: number
  personasTotales: number
  primerTurno: {
    limite: number
    ocupadas: number
    disponibles: number
  }
  segundoTurno: {
    limite: number
    ocupadas: number
    disponibles: number
  }
}

interface MenuItem {
  id: string
  categoria_id: string
  nombre: string
  descripcion: string | null
  precio: number
  disponible: boolean
  orden: number
}

interface Category {
  id: string
  nombre: string
  orden: number
}

export type { AdminData, PlazasStats, MenuItem, Category }
