#!/usr/bin/env node

console.log('🔍 Verificando variables de entorno...\n')

// Variables requeridas
const requiredVars = [
  'NEXT_PUBLIC_LOCAL_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

console.log('📋 Variables requeridas:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  const displayValue = value ? `${value.substring(0, 20)}...` : 'No configurada'
  console.log(`${status} ${varName}: ${displayValue}`)
})

console.log('\n🔧 Variables de entorno disponibles:')
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    const value = process.env[key]
    console.log(`  ${key}: ${value ? 'Configurada' : 'No configurada'}`)
  })

console.log('\n🌍 Información del entorno:')
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`  Platform: ${process.platform}`)
console.log(`  Node version: ${process.version}`)

// Verificar si estamos en Vercel
const isVercel = process.env.VERCEL === '1'
console.log(`  Vercel: ${isVercel ? '✅ Sí' : '❌ No'}`)

if (isVercel) {
  console.log('\n📊 Información de Vercel:')
  console.log(`  VERCEL_ENV: ${process.env.VERCEL_ENV}`)
  console.log(`  VERCEL_URL: ${process.env.VERCEL_URL}`)
  console.log(`  VERCEL_GIT_COMMIT_SHA: ${process.env.VERCEL_GIT_COMMIT_SHA}`)
}

console.log('\n✨ Verificación completada!')
