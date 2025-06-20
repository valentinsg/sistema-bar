#!/usr/bin/env node

// Script para probar el manejo de fechas

console.log("🗓️ Test de manejo de fechas\n")

const today = new Date()
console.log("Fecha actual completa:", today)
console.log("Fecha actual (solo día):", today.toISOString().split("T")[0])

// Simular formatDateString del calendario
const formatDateString = (day) => {
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const dayStr = day.toString().padStart(2, "0")
  return `${year}-${month}-${dayStr}`
}

console.log("\nFecha de hoy formateada:", formatDateString(today.getDate()))

// Simular isPastDate
const isPastDate = (day) => {
  const dayDate = new Date(today.getFullYear(), today.getMonth(), day)
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dayNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
  
  return dayNormalized < todayNormalized
}

console.log("\nTest de isPastDate:")
console.log("Ayer es pasado:", isPastDate(today.getDate() - 1))
console.log("Hoy es pasado:", isPastDate(today.getDate()))
console.log("Mañana es pasado:", isPastDate(today.getDate() + 1))

// Simular validación del formulario
const validateFormDate = (fechaStr) => {
  const todayStr = today.getFullYear() + '-' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(today.getDate()).padStart(2, '0')
  
  return fechaStr < todayStr
}

const todayStr = formatDateString(today.getDate())
const yesterdayStr = formatDateString(today.getDate() - 1)
const tomorrowStr = formatDateString(today.getDate() + 1)

console.log("\nTest de validación formulario:")
console.log(`Ayer (${yesterdayStr}) es inválido:`, validateFormDate(yesterdayStr))
console.log(`Hoy (${todayStr}) es inválido:`, validateFormDate(todayStr))
console.log(`Mañana (${tomorrowStr}) es inválido:`, validateFormDate(tomorrowStr))

console.log("\n✅ Test completado")
console.log("Si ves 'Hoy es pasado: false' y 'Hoy es inválido: false', está funcionando correctamente") 