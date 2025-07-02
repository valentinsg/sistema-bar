// Script para diagnosticar problemas de rendimiento
// Ejecutar en la consola del navegador

console.log('🔍 Iniciando diagnóstico de rendimiento...')

// Función para medir el tiempo de ejecución
function measureExecutionTime(fn, name) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
  return result
}

// Función para contar llamadas a funciones
const callCounters = new Map()

function trackFunctionCalls(fn, name) {
  return function(...args) {
    const count = callCounters.get(name) || 0
    callCounters.set(name, count + 1)

    if (count % 10 === 0) { // Log cada 10 llamadas
      console.log(`📞 ${name} llamada #${count + 1}`)
    }

    return fn.apply(this, args)
  }
}

// Función para analizar componentes React
function analyzeReactComponents() {
  console.log('\n🎯 Analizando componentes React...')

  // Buscar componentes de reservas
  const reservationForm = document.querySelector('[data-testid="reservation-form"]') ||
                         document.querySelector('form')
  const reservationCalendar = document.querySelector('[data-testid="reservation-calendar"]') ||
                             document.querySelector('.calendar-container')

  if (reservationForm) {
    console.log('✅ ReservationForm encontrado')
    console.log('📊 Elementos en el formulario:', reservationForm.querySelectorAll('*').length)
  }

  if (reservationCalendar) {
    console.log('✅ ReservationCalendar encontrado')
    console.log('📊 Elementos en el calendario:', reservationCalendar.querySelectorAll('*').length)
  }
}

// Función para analizar imágenes y recursos
function analyzeResources() {
  console.log('\n🖼️ Analizando recursos...')

  const images = document.querySelectorAll('img')
  console.log(`📸 Total de imágenes: ${images.length}`)

  let totalImageSize = 0
  images.forEach((img, index) => {
    if (img.complete) {
      console.log(`🖼️ Imagen ${index + 1}: ${img.src} - ${img.naturalWidth}x${img.naturalHeight}`)
    }
  })

  // Analizar CSS y JS
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  const scripts = document.querySelectorAll('script[src]')

  console.log(`🎨 Stylesheets: ${stylesheets.length}`)
  console.log(`📜 Scripts externos: ${scripts.length}`)
}

// Función para analizar efectos visuales
function analyzeVisualEffects() {
  console.log('\n✨ Analizando efectos visuales...')

  const elementsWithBackdropFilter = document.querySelectorAll('[style*="backdrop-filter"]')
  const elementsWithBoxShadow = document.querySelectorAll('[style*="box-shadow"]')
  const elementsWithGradient = document.querySelectorAll('[style*="gradient"]')

  console.log(`🔍 Elementos con backdrop-filter: ${elementsWithBackdropFilter.length}`)
  console.log(`🌫️ Elementos con box-shadow: ${elementsWithBoxShadow.length}`)
  console.log(`🌈 Elementos con gradient: ${elementsWithGradient.length}`)

  // Contar animaciones CSS
  const animatedElements = document.querySelectorAll('[class*="animate-"]')
  console.log(`🎬 Elementos con animaciones CSS: ${animatedElements.length}`)
}

// Función para monitorear llamadas a la API
function monitorAPICalls() {
  console.log('\n🌐 Monitoreando llamadas a la API...')

  // Interceptar fetch
  const originalFetch = window.fetch
  let fetchCount = 0

  window.fetch = function(...args) {
    fetchCount++
    const start = performance.now()

    console.log(`📡 Fetch #${fetchCount}: ${args[0]}`)

    return originalFetch.apply(this, args).then(response => {
      const end = performance.now()
      console.log(`✅ Fetch #${fetchCount} completado en ${(end - start).toFixed(2)}ms`)
      return response
    }).catch(error => {
      const end = performance.now()
      console.log(`❌ Fetch #${fetchCount} falló en ${(end - start).toFixed(2)}ms:`, error)
      throw error
    })
  }

  // Interceptar XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open
  let xhrCount = 0

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    xhrCount++
    console.log(`📡 XHR #${xhrCount}: ${method} ${url}`)
    return originalXHROpen.apply(this, [method, url, ...args])
  }
}

// Función para analizar el rendimiento de Framer Motion
function analyzeFramerMotion() {
  console.log('\n🎭 Analizando Framer Motion...')

  const motionElements = document.querySelectorAll('[data-framer-motion]')
  console.log(`🎬 Elementos de Framer Motion: ${motionElements.length}`)

  // Buscar elementos con animaciones activas
  const animatedElements = document.querySelectorAll('[style*="transform"]')
  console.log(`🔄 Elementos con transformaciones: ${animatedElements.length}`)
}

// Función para generar reporte de rendimiento
function generatePerformanceReport() {
  console.log('\n📊 REPORTE DE RENDIMIENTO')
  console.log('=' .repeat(50))

  // Métricas básicas
  const memory = performance.memory
  if (memory) {
    console.log(`💾 Memoria usada: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`💾 Memoria total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
    console.log(`💾 Límite de memoria: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`)
  }

  // Contadores de llamadas
  console.log('\n📞 CONTADORES DE LLAMADAS:')
  for (const [name, count] of callCounters) {
    console.log(`  ${name}: ${count} llamadas`)
  }

  // Elementos del DOM
  console.log(`\n🏗️ ELEMENTOS DEL DOM: ${document.querySelectorAll('*').length}`)

  // Event listeners
  console.log('\n🎧 EVENT LISTENERS ACTIVOS:')
  const eventTypes = ['click', 'scroll', 'resize', 'input', 'change']
  eventTypes.forEach(type => {
    const elements = document.querySelectorAll(`[on${type}]`)
    if (elements.length > 0) {
      console.log(`  ${type}: ${elements.length} elementos`)
    }
  })
}

// Función principal
function runPerformanceDiagnostic() {
  console.log('🚀 Iniciando diagnóstico completo de rendimiento...')

  // Ejecutar análisis
  measureExecutionTime(analyzeReactComponents, 'Análisis de componentes React')
  measureExecutionTime(analyzeResources, 'Análisis de recursos')
  measureExecutionTime(analyzeVisualEffects, 'Análisis de efectos visuales')
  measureExecutionTime(analyzeFramerMotion, 'Análisis de Framer Motion')

  // Iniciar monitoreo
  monitorAPICalls()

  // Generar reporte después de un delay
  setTimeout(() => {
    generatePerformanceReport()
  }, 2000)

  console.log('\n✅ Diagnóstico iniciado. Revisa la consola para ver los resultados.')
  console.log('💡 Para detener el monitoreo, ejecuta: stopPerformanceMonitoring()')
}

// Función para detener el monitoreo
function stopPerformanceMonitoring() {
  console.log('🛑 Deteniendo monitoreo de rendimiento...')

  // Restaurar fetch original
  if (window._originalFetch) {
    window.fetch = window._originalFetch
  }

  // Restaurar XMLHttpRequest original
  if (window._originalXHROpen) {
    XMLHttpRequest.prototype.open = window._originalXHROpen
  }

  console.log('✅ Monitoreo detenido')
}

// Guardar referencias originales
window._originalFetch = window.fetch
window._originalXHROpen = XMLHttpRequest.prototype.open

// Exponer funciones globalmente
window.runPerformanceDiagnostic = runPerformanceDiagnostic
window.stopPerformanceMonitoring = stopPerformanceMonitoring
window.measureExecutionTime = measureExecutionTime
window.trackFunctionCalls = trackFunctionCalls

console.log('🔧 Script de diagnóstico cargado. Ejecuta runPerformanceDiagnostic() para comenzar.')
