# Optimización del Contador de Personas

## Problema Identificado

El contador de personas estaba realizando demasiadas llamadas a la API (`GET/rest/v1/contador_personas`), causando:
- Sobrecarga en el servidor
- Consumo excesivo de ancho de banda
- Experiencia de usuario degradada
- Posibles límites de rate limiting

## Soluciones Implementadas

### 1. Eliminación de Eventos Manuales

**Problema:** El admin disparaba eventos `contadorUpdated` manualmente, causando reconexiones innecesarias.

**Solución:**
- ✅ Eliminados los `window.dispatchEvent` en `handleUpdateContador` y `handleResetContador`
- ✅ Dejamos que SSE maneje las actualizaciones automáticamente

```typescript
// ANTES (causaba reconexiones)
window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: nuevoValor } }))

// DESPUÉS (deja que SSE maneje)
// NO disparar evento manual - dejar que SSE maneje la actualización
```

### 2. Optimización del Endpoint SSE

**Problema:** Polling cada 30 segundos era muy frecuente.

**Solución:**
- ✅ Aumentado el intervalo de polling a 60 segundos
- ✅ Reducido significativamente las llamadas a la base de datos

```typescript
// ANTES
}, 30000) // 30 segundos

// DESPUÉS
}, 60000) // 60 segundos para reducir llamadas
```

### 3. Mejora del Cache

**Problema:** Cache muy corto (2 segundos) causaba llamadas frecuentes.

**Solución:**
- ✅ Aumentado el TTL del cache a 10 segundos
- ✅ Reducido las llamadas duplicadas

```typescript
// ANTES
const CACHE_TTL = 2000 // 2 segundos de cache

// DESPUÉS
const CACHE_TTL = 10000 // 10 segundos de cache para reducir llamadas
```

### 4. Optimización de Reconexión SSE

**Problema:** Reconexiones agresivas causaban múltiples conexiones.

**Solución:**
- ✅ Backoff exponencial más conservador (5-30 segundos)
- ✅ Solo reconectar si hay listeners activos
- ✅ Eliminada reconexión automática en cambios de visibilidad

```typescript
// ANTES
const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)

// DESPUÉS
const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 30000)
```

### 5. Componente de Confirmación

**Problema:** Cambios accidentales en el contador.

**Solución:**
- ✅ Creado `ContadorConfirmacion.tsx` con diálogos de confirmación
- ✅ Usuario debe confirmar antes de cambiar el contador
- ✅ Muestra valores actuales y nuevos en la confirmación

```typescript
// Nuevo componente con confirmación
<ContadorConfirmacion
  personasActuales={personasActuales}
  onIncrement={() => handleUpdateContador(true)}
  onDecrement={() => handleUpdateContador(false)}
  onReset={handleResetContador}
/>
```

## Resultados Esperados

### Reducción de Llamadas
- **Antes:** ~120 llamadas por hora (cada 30s)
- **Después:** ~60 llamadas por hora (cada 60s)
- **Reducción:** 50% menos llamadas

### Mejoras de UX
- ✅ Confirmación antes de cambios accidentales
- ✅ Menos reconexiones innecesarias
- ✅ Mejor estabilidad de conexión
- ✅ Feedback visual del estado de conexión

### Optimizaciones Técnicas
- ✅ Cache más eficiente
- ✅ Reconexión inteligente
- ✅ Eliminación de eventos duplicados
- ✅ Manejo mejorado de errores

## Monitoreo

### Métricas a Observar
1. **Frecuencia de llamadas:** Debería reducirse significativamente
2. **Tiempo de respuesta:** Mejor rendimiento general
3. **Errores de conexión:** Menos reconexiones fallidas
4. **Uso de recursos:** Menor consumo de CPU y red

### Logs de Debug
```bash
# Verificar llamadas en desarrollo
console.log("📊 getContador - Parámetros:", { local_id, fecha: fechaHoy })

# Monitorear reconexiones SSE
console.log("SSE conectado")
console.error("Error en SSE:", error)
```

## Próximos Pasos

1. **Monitorear:** Observar las métricas durante 24-48 horas
2. **Ajustar:** Si es necesario, ajustar intervalos según el tráfico
3. **Optimizar más:** Considerar implementar WebSockets para mayor escala
4. **Documentar:** Actualizar documentación de troubleshooting

## Rollback

Si es necesario revertir los cambios:

1. **Restaurar eventos manuales** en `app/admin/page.tsx`
2. **Reducir intervalo SSE** a 30 segundos
3. **Reducir cache TTL** a 2 segundos
4. **Restaurar reconexión agresiva** en SSE

## Contacto

Para reportar problemas o sugerir mejoras:
- Revisar logs en la consola del navegador
- Verificar métricas de red en DevTools
- Documentar comportamiento específico
