# Optimizaciones Implementadas - Reducción de Llamadas API

## 🎯 Objetivo
Reducir significativamente las llamadas repetidas a `/rest/v1/contador_personas` y `/rest/v1/reservas` que estaban causando sobrecarga en el servidor.

## 📊 Problema Identificado
- **Polling excesivo**: Componentes haciendo polling cada 10-30 segundos
- **Múltiples conexiones SSE**: Varios componentes creando conexiones simultáneas
- **Cache insuficiente**: TTL muy corto causando llamadas frecuentes
- **Falta de optimización de visibilidad**: Llamadas continuas incluso con pestañas ocultas

## ✅ Optimizaciones Implementadas

### 1. **Componente Live Counter Test** (`components/live-counter-test.tsx`)
**Antes:** Polling cada 10 segundos
**Después:** Polling cada 30 segundos + manejo de visibilidad

```typescript
// ANTES
intervalRef.current = setInterval(cargarContador, 10000)

// DESPUÉS
intervalRef.current = setInterval(cargarContador, 30000)

// Agregado manejo de visibilidad
const handleVisibilityChange = () => {
  isVisibleRef.current = !document.hidden
}
```

**Reducción:** 66% menos llamadas (de 6 a 2 por minuto)

### 2. **Hook de Estado de Conexión** (`hooks/use-connection-status.ts`)
**Antes:** Ping cada 30 segundos
**Después:** Ping cada 60 segundos + omisión en pestañas ocultas

```typescript
// ANTES
const pingInterval = setInterval(pingServer, 30000)

// DESPUÉS
const pingInterval = setInterval(pingServer, 60000)

// Agregado omisión en pestañas ocultas
if (document.hidden) {
  console.log("🔄 Ping omitido - pestaña oculta")
  return
}
```

**Reducción:** 50% menos llamadas (de 2 a 1 por minuto)

### 3. **Cache de Contador** (`lib/storage.ts`)
**Antes:** TTL de 10 segundos
**Después:** TTL de 30 segundos + limpieza más eficiente

```typescript
// ANTES
const CACHE_TTL = 10000 // 10 segundos

// DESPUÉS
const CACHE_TTL = 30000 // 30 segundos

// Limpieza más frecuente
if (memoryCache.size > 50) // Antes era 100
```

**Reducción:** 66% menos llamadas duplicadas

### 4. **Cache de Reservas** (`hooks/useReservas.ts`)
**Antes:** TTL de 30 segundos
**Después:** TTL de 60 segundos

```typescript
// ANTES
const CACHE_TTL = 30 * 1000 // 30 segundos

// DESPUÉS
const CACHE_TTL = 60 * 1000 // 60 segundos
```

**Reducción:** 50% menos llamadas duplicadas

### 5. **Endpoint SSE** (`app/api/contador/sse/route.ts`)
**Antes:** Polling cada 60 segundos
**Después:** Polling cada 90 segundos

```typescript
// ANTES
}, 60000) // 60 segundos

// DESPUÉS
}, 90000) // 90 segundos
```

**Reducción:** 33% menos llamadas (de 1 a 0.67 por minuto)

### 6. **Componente Optimizado** (`components/live-counter-optimized.tsx`)
**Nuevo componente** que combina todas las mejores prácticas:
- Singleton SSE Manager para una sola conexión
- Manejo inteligente de visibilidad
- Backoff exponencial para reconexiones
- Cache de datos en memoria

## 📈 Resultados Esperados

### Reducción Total de Llamadas
- **Contador de personas:** ~75% menos llamadas
- **Reservas:** ~50% menos llamadas
- **Ping de conexión:** ~50% menos llamadas

### Mejoras de Rendimiento
- **Menor uso de CPU** en el servidor
- **Menor consumo de ancho de banda**
- **Mejor experiencia de usuario**
- **Reducción de rate limiting**

### Experiencia de Usuario
- **Actualizaciones más suaves**
- **Menos errores de conexión**
- **Mejor rendimiento en dispositivos móviles**
- **Optimización automática en pestañas ocultas**

## 🔧 Configuración Actual

| Componente | Intervalo Anterior | Intervalo Actual | Reducción |
|------------|-------------------|------------------|-----------|
| Live Counter Test | 10s | 30s | 66% |
| Connection Status | 30s | 60s | 50% |
| Contador Cache | 10s | 30s | 66% |
| Reservas Cache | 30s | 60s | 50% |
| SSE Polling | 60s | 90s | 33% |

## 🚀 Uso del Componente Optimizado

Para usar el componente optimizado en lugar del actual:

```tsx
// Cambiar de:
import LiveCounter from "@/components/live-counter-sse"

// A:
import LiveCounter from "@/components/live-counter-optimized"
```

## 📋 Monitoreo

Para verificar que las optimizaciones funcionan:

1. **Abrir DevTools > Network**
2. **Filtrar por "contador_personas" y "reservas"**
3. **Observar la reducción de llamadas**
4. **Verificar que no hay llamadas cuando la pestaña está oculta**

## 🔄 Rollback

Si es necesario revertir los cambios:

1. **Restaurar intervalos originales** en cada archivo
2. **Volver al componente SSE original**
3. **Reducir TTL de cache**

## 📞 Próximos Pasos

1. **Monitorear** el rendimiento en producción
2. **Ajustar** intervalos según el tráfico real
3. **Considerar** implementar WebSockets para mayor escala
4. **Documentar** métricas de rendimiento

---

**Nota:** Estas optimizaciones mantienen la funcionalidad en tiempo real mientras reducen significativamente la carga en el servidor.
