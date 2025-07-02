"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, Check, Minus, Plus, RotateCcw, X } from "lucide-react"
import { useState } from "react"

interface ContadorConfirmacionProps {
  personasActuales: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
  onBulkUpdate?: (changes: number) => void
}

export default function ContadorConfirmacion({
  personasActuales,
  onIncrement,
  onDecrement,
  onReset,
  onBulkUpdate
}: ContadorConfirmacionProps) {
  const [pendingChanges, setPendingChanges] = useState(0)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  const handleIncrement = () => {
    setPendingChanges(prev => prev + 1)
    setHasPendingChanges(true)
  }

  const handleDecrement = () => {
    if (personasActuales + pendingChanges > 0) {
      setPendingChanges(prev => prev - 1)
      setHasPendingChanges(true)
    }
  }

  const handleReset = () => {
    setPendingChanges(-personasActuales)
    setHasPendingChanges(true)
  }

  const confirmChanges = () => {
    if (onBulkUpdate && pendingChanges !== 0) {
      // Usar la función de cambios acumulados si está disponible
      onBulkUpdate(pendingChanges)
    } else {
      // Fallback a las funciones individuales
      if (pendingChanges > 0) {
        // Aplicar incrementos
        for (let i = 0; i < pendingChanges; i++) {
          onIncrement()
        }
      } else if (pendingChanges < 0) {
        // Aplicar decrementos
        for (let i = 0; i < Math.abs(pendingChanges); i++) {
          onDecrement()
        }
      }
    }

    // Limpiar cambios pendientes
    setPendingChanges(0)
    setHasPendingChanges(false)
  }

  const cancelChanges = () => {
    setPendingChanges(0)
    setHasPendingChanges(false)
  }

  const getPendingText = () => {
    const newTotal = personasActuales + pendingChanges
    if (pendingChanges > 0) {
      return `+${pendingChanges} (${personasActuales} → ${newTotal})`
    } else if (pendingChanges < 0) {
      return `${pendingChanges} (${personasActuales} → ${newTotal})`
    }
    return ''
  }

  const getPendingColor = () => {
    if (pendingChanges > 0) return 'bg-green-900 text-green-100'
    if (pendingChanges < 0) return 'bg-red-900 text-red-100'
    return 'bg-gray-900 text-gray-100'
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Botón Incrementar */}
      <Button
        onClick={handleIncrement}
        className="bg-green-600 hover:bg-green-700 px-3 py-1.5 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
      >
        <Plus className="w-3 h-3" />
      </Button>

      {/* Botón Decrementar */}
      <Button
        onClick={handleDecrement}
        className="border-red-600 text-red-400 hover:bg-red-900/20 px-3 py-1.5 transition-all duration-200"
        disabled={personasActuales + pendingChanges <= 0}
      >
        <Minus className="w-3 h-3" />
      </Button>

      {/* Botón Reset */}
      <Button
        onClick={handleReset}
        className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-3 py-1.5 transition-all duration-200"
        disabled={personasActuales === 0 && pendingChanges === 0}
      >
        <RotateCcw className="w-3 h-3" />
      </Button>

      {/* Botones de Confirmación/Cancelación */}
      {hasPendingChanges && (
        <div className="flex gap-1 mt-2">
          <Button
            onClick={confirmChanges}
            className="bg-green-600 hover:bg-green-700 px-2 py-1.5 transition-all duration-200 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Confirmar
          </Button>
          <Button
            onClick={cancelChanges}
            className="bg-gray-600 hover:bg-gray-700 px-2 py-1.5 transition-all duration-200 text-xs"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Indicador de cambios pendientes */}
      {hasPendingChanges && (
        <div className={`absolute -top-8 left-0 ${getPendingColor()} text-xs px-2 py-1 rounded whitespace-nowrap flex items-center gap-1`}>
          <ArrowUp className="w-3 h-3" />
          {getPendingText()}
        </div>
      )}
    </div>
  )
}
