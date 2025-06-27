# Pasos para Diagnosticar el Live Counter en Producción

## 🔍 Problema Actual
El live counter no se muestra en producción en Vercel, aunque el build se completa correctamente.

## 🛠️ Herramientas de Diagnóstico Implementadas

### 1. Debug Counter (`components/debug-counter.tsx`)
- Muestra información del cliente y servidor
- Verifica variables de entorno
- Indica si el contador debería mostrarse

### 2. Live Counter Test (`components/live-counter-test.tsx`)
- Versión simplificada que siempre se muestra
- Logs detallados en consola
- Información de debug visible

### 3. Endpoint de Variables de Entorno (`/api/debug/env`)
- Verifica variables del servidor
- Información de Vercel
- Estado de configuración

## 📋 Pasos para Diagnosticar

### Paso 1: Deploy y Verificar
1. **Deploy** los cambios a Vercel
2. **Abrir** la página en producción
3. **Verificar** que aparezca el debug counter (esquina superior derecha)
4. **Revisar** la información mostrada

### Paso 2: Verificar Variables de Entorno
1. **Ir a** `/api/debug/env` en producción
2. **Verificar** que `NEXT_PUBLIC_LOCAL_ID` esté configurada
3. **Confirmar** que las variables de Supabase estén presentes

### Paso 3: Revisar Console del Navegador
1. **Abrir** DevTools (F12)
2. **Ir a** la pestaña Console
3. **Buscar** logs que empiecen con:
   - 🔍 Debug info
   - 🚀 Iniciando live counter test
   - ✅ Contador cargado
   - ❌ Error al cargar contador

### Paso 4: Verificar Network Tab
1. **Ir a** la pestaña Network
2. **Recargar** la página
3. **Buscar** requests a:
   - `/api/debug/env`
   - `/api/health`
   - Supabase endpoints

## 🔧 Posibles Causas y Soluciones

### Causa 1: Variables de Entorno No Configuradas
**Síntomas:**
- Debug counter muestra "LOCAL_ID: ❌ No configurado"
- Error en console: "LOCAL_ID no configurado"

**Solución:**
1. Ir a Vercel Dashboard
2. Proyecto → Settings → Environment Variables
3. Agregar `NEXT_PUBLIC_LOCAL_ID` con el valor correcto
4. Redeploy

### Causa 2: Lógica de Horario
**Síntomas:**
- Debug counter muestra "shouldShow: false"
- Hora actual fuera del rango 19:00-06:00

**Solución:**
- El contador solo se muestra en horario de operación
- Para testing, usar la versión de test que siempre se muestra

### Causa 3: Error de Conexión a Supabase
**Síntomas:**
- Error en console sobre Supabase
- Network tab muestra errores 4xx/5xx

**Solución:**
1. Verificar variables de Supabase en Vercel
2. Confirmar que el dominio esté en la whitelist de Supabase
3. Verificar permisos de la base de datos

### Causa 4: Problema de Hidratación
**Síntomas:**
- Componente no se monta
- Logs muestran "No montado o no hidratado"

**Solución:**
- Ya implementado con `isMounted` y `isHydrated`
- Verificar que no haya errores de SSR

## 📊 Información a Recolectar

### Del Debug Counter:
```json
{
  "LOCAL_ID": "valor_o_undefined",
  "hasLocalId": true/false,
  "nodeEnv": "production",
  "hostname": "tu-dominio.vercel.app",
  "currentHour": 14,
  "shouldShow": true/false
}
```

### Del Endpoint `/api/debug/env`:
```json
{
  "NEXT_PUBLIC_LOCAL_ID": "Configurada/No configurada",
  "NEXT_PUBLIC_SUPABASE_URL": "Configurada/No configurada",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "Configurada/No configurada",
  "NODE_ENV": "production",
  "VERCEL": "Sí/No"
}
```

## 🚀 Próximos Pasos

1. **Deploy** los cambios de diagnóstico
2. **Recolectar** la información del debug counter
3. **Compartir** los logs de la console
4. **Verificar** el endpoint `/api/debug/env`
5. **Identificar** la causa específica del problema

## 📞 Contacto

Una vez que tengas la información del debug counter y los logs, compártela para poder identificar exactamente qué está causando el problema.

### Información Necesaria:
- Screenshot del debug counter
- Logs de la console del navegador
- Respuesta del endpoint `/api/debug/env`
- Hora actual cuando pruebas
- URL de producción
