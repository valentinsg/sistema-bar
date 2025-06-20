#!/usr/bin/env node

// Script para verificar que el proyecto está configurado correctamente

console.log("🔍 Verificando configuración del proyecto...\n")

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_LOCAL_ID'
]

let missingVars = []

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    missingVars.push(varName)
    console.log(`❌ ${varName}: No configurada`)
  } else {
    console.log(`✅ ${varName}: Configurada`)
  }
})

if (missingVars.length > 0) {
  console.log(`\n⚠️  Faltan ${missingVars.length} variables de entorno`)
  console.log("\n📝 Para solucionarlo:")
  console.log("1. Crea un archivo .env.local en la raíz del proyecto")
  console.log("2. Agrega las siguientes variables:")
  missingVars.forEach(varName => {
    console.log(`   ${varName}=valor_aquí`)
  })
  console.log("\n📖 Consulta SETUP.md para más detalles")
} else {
  console.log("\n✅ Todas las variables de entorno están configuradas")
}

console.log("\n🔍 Próximos pasos:")
console.log("1. Ejecuta: npm run dev")
console.log("2. Ve a: http://localhost:3000")
console.log("3. Prueba el contador en: http://localhost:3000/admin")
console.log("4. Revisa la consola del navegador para logs de debug") 