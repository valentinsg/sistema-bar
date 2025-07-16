"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Check, Minus, Plus, RotateCcw, Users, X } from "lucide-react"
import { useState } from "react"

interface ContadorConfirmacionProps {
  personasActuales: number
  onIncrementAction: () => void
  onDecrementAction: () => void
  onResetAction: () => void
  onBulkUpdateAction?: (changes: number) => void
}

export default function ContadorConfirmacion({
  personasActuales,
  onIncrementAction,
  onDecrementAction,
  onResetAction,
  onBulkUpdateAction
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

  const handleBulkIncrement = (amount: number) => {
    setPendingChanges(prev => prev + amount)
    setHasPendingChanges(true)
  }

  const handleBulkDecrement = (amount: number) => {
    const newPending = pendingChanges - amount
    const newTotal = personasActuales + newPending
    if (newTotal >= 0) {
      setPendingChanges(newPending)
      setHasPendingChanges(true)
    }
  }

  const handleReset = () => {
    setPendingChanges(-personasActuales)
    setHasPendingChanges(true)
  }

  const confirmChanges = () => {
    if (onBulkUpdateAction && pendingChanges !== 0) {
      onBulkUpdateAction(pendingChanges)
    } else {
      if (pendingChanges > 0) {
        for (let i = 0; i < pendingChanges; i++) {
          onIncrementAction()
        }
      } else if (pendingChanges < 0) {
        for (let i = 0; i < Math.abs(pendingChanges); i++) {
          onDecrementAction()
        }
      }
    }

    setPendingChanges(0)
    setHasPendingChanges(false)
  }

  const cancelChanges = () => {
    setPendingChanges(0)
    setHasPendingChanges(false)
  }

  const getPendingTotal = () => personasActuales + pendingChanges

  return (
    <div className="relative">
      {/* Indicador de cambios pendientes flotante */}
      <AnimatePresence>
        {hasPendingChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-slate-800/95 backdrop-blur-xl border border-amber-500/30 rounded-lg px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 font-medium">
                  {personasActuales}
                </span>
                <ArrowUp className="w-3 h-3 text-amber-300" />
                <span className={`font-bold ${pendingChanges > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {getPendingTotal()}
                </span>
                <Badge
                  className={`text-xs px-2 py-0.5 ${
                    pendingChanges > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {pendingChanges > 0 ? `+${pendingChanges}` : pendingChanges}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {/* Controles principales */}
        <div className="grid grid-cols-3 gap-2">
          {/* Incrementar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleIncrement}
              className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-500/30 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Decrementar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleDecrement}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
              disabled={personasActuales + pendingChanges <= 0}
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Reset */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-200"
              disabled={personasActuales === 0 && pendingChanges === 0}
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Controles de cambio rápido */}
        <div className="space-y-2">
          <Separator className="bg-amber-500/20" />

          {/* Incrementos rápidos */}
          <div className="flex justify-center gap-1">
            {[5, 10, 20].map((amount) => (
              <motion.div
                key={`inc-${amount}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleBulkIncrement(amount)}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 h-6 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  +{amount}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Decrementos rápidos */}
          <div className="flex justify-center gap-1">
            {[5, 10, 20].map((amount) => (
              <motion.div
                key={`dec-${amount}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleBulkDecrement(amount)}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 h-6 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  disabled={personasActuales + pendingChanges - amount < 0}
                >
                  -{amount}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Botones de confirmación */}
        <AnimatePresence>
          {hasPendingChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Separator className="bg-amber-500/20 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={confirmChanges}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Confirmar
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={cancelChanges}
                    variant="outline"
                    className="w-full border-slate-500/30 text-slate-400 hover:bg-slate-500/10 transition-all duration-200"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
