# Solución para Live Counter en Vercel

## Problema Identificado

El live counter tenía problemas en producción en Vercel debido a:
- Límites de tiempo de ejecución en funciones serverless
- Problemas con polling tradicional usando `setInterval`
- Falta de manejo robusto de errores y reconexión

## Soluciones Implementadas

### 1. Live Counter Mejorado (`components/live-counter.tsx`)

**Mejoras principales:**
- ✅ Retry exponencial con backoff
- ✅ Mejor manejo de errores de red
- ✅ Detección de estado online/offline
- ✅ Limpieza adecuada de timeouts
- ✅ Botón de reintento manual
- ✅ Intervalo aumentado a 15 segundos (más amigable para Vercel)

**Características:**
- Manejo de reconexión automática
- Indicadores visuales de estado
- Logs detallados en desarrollo
- Optimización para pestañas ocultas

### 2. Versión SSE (`components/live-counter-sse.tsx`)

**Alternativa usando Server-Sent Events:**
- ✅ Más eficiente que polling tradicional
- ✅ Conexión persistente desde el servidor
- ✅ Menos carga en el cliente
- ✅ Reconexión automática

**Endpoint SSE:** `/api/contador/sse`

### 3. Configuración Next.js Optimizada

**`next.config.mjs`:**
- Headers específicos para SSE
- Configuraciones para Vercel
- Optimizaciones de caché

### 4. Hook de Estado de Conexión

**`hooks/use-connection-status.ts`:**
- Monitoreo de conectividad
- Ping al servidor
- Detección de latencia
- Estado de red en tiempo real

### 5. Health Check Endpoint

**`/api/health`:**
- Verificación de conectividad
- Método HEAD para ping rápido
- Información de uptime

## Cómo Usar

### Opción 1: Live Counter Mejorado (Recomendado)
```tsx
import LiveCounter from '@/components/live-counter'

// En tu página
<LiveCounter />
```

### Opción 2: Versión SSE
```tsx
import LiveCounterSSE from '@/components/live-counter-sse'

// En tu página
<LiveCounterSSE />
```

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_LOCAL_ID=tu_local_id_aqui
```

## Monitoreo y Debugging

### Logs en Desarrollo
- Todos los errores se loguean en consola
- Contador de requests
- Estado de reconexión

### Indicadores Visuales
- 🔴 Error de conexión
- 🟡 Reconectando
- 🟢 Conectado y funcionando

### Métricas Disponibles
- Última actualización
- Latencia de conexión
- Estado de red
- Contador de reintentos

## Troubleshooting

### Si el contador no se actualiza:
1. Verifica `NEXT_PUBLIC_LOCAL_ID` en las variables de entorno
2. Revisa la consola del navegador para errores
3. Usa el botón "Reintentar" manualmente
4. Verifica la conectividad a internet

### Si hay errores de CORS:
1. Verifica que el dominio esté configurado en Supabase
2. Revisa las configuraciones de CORS en `next.config.mjs`

### Si el SSE no funciona:
1. Verifica que el endpoint `/api/contador/sse` esté accesible
2. Revisa los logs del servidor en Vercel
3. Considera usar la versión de polling tradicional

## Optimizaciones para Vercel

### Límites de Tiempo
- Polling cada 15 segundos (no 10)
- Timeouts de reconexión escalonados
- Limpieza de recursos al cambiar pestaña

### Manejo de Errores
- Retry exponencial con máximo 5 intentos
- Fallback a estado de error después de fallos
- Recuperación automática al volver online

### Rendimiento
- Cache en memoria para reducir llamadas
- Optimización de re-renders
- Lazy loading de componentes

## Próximos Pasos

1. **Implementar**: Usa la versión mejorada del live counter
2. **Monitorear**: Revisa los logs en Vercel
3. **Optimizar**: Ajusta intervalos según el tráfico
4. **Escalar**: Considera implementar WebSockets para mayor escala

## Contacto

Si persisten los problemas, revisa:
- Logs de Vercel en el dashboard
- Console del navegador
- Network tab para ver las requests
- Variables de entorno en Vercel
