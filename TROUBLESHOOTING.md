# Guía de Solución de Problemas

## 🚨 Problemas Comunes

### 1. El contador en vivo se queda en 0

**Síntomas:**
- El contador en el admin funciona, pero en el frontend no se actualiza
- Aparece "0 personas" aunque en admin se incrementó el número

**Soluciones:**

#### A. Verificar Variables de Entorno
```bash
# Ejecuta este comando para verificar la configuración
node scripts/verify-setup.js
```

Si faltan variables, crea `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
NEXT_PUBLIC_LOCAL_ID=tu_local_id_aqui
```

#### B. Verificar Logs en la Consola
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca estos mensajes:

**Buenos signos:**
```
🔧 LiveCounter - LOCAL_ID: local_test_001
📊 getContador - Parámetros: {local_id: "...", fecha: "2024-..."}
✅ getContador - Cantidad encontrada: 5
📡 Estado suscripción contador: SUBSCRIBED
```

**Signos de problemas:**
```
❌ NEXT_PUBLIC_LOCAL_ID no está configurado
❌ Variables de Supabase no configuradas
❌ Error al cargar contador: ...
```

#### C. Verificar Base de Datos
Ejecuta en el SQL Editor de Supabase:
```sql
-- Ver si existe la tabla
SELECT * FROM contador_personas;

-- Ver datos del día de hoy
SELECT * FROM contador_personas 
WHERE fecha = CURRENT_DATE;

-- Ver el local_id configurado
SELECT * FROM locales;
```

#### D. Verificar Real-time en Supabase
1. Ve a tu proyecto de Supabase
2. Settings > API > Realtime
3. Asegúrate de que esté habilitado
4. Ve a Table Editor > contador_personas
5. Activa "Enable Realtime"

### 2. No se pueden hacer reservas para hoy

**Síntomas:**
- El botón de hoy aparece deshabilitado en el calendario
- El formulario dice "La fecha no puede ser en el pasado" para la fecha de hoy
- No se pueden ver las reservas del día actual

**Soluciones:**

#### A. Test de Fechas
```bash
# Ejecuta este test para verificar el manejo de fechas
node scripts/test-dates.js
```

#### B. Verificar en la Consola
1. Abre F12 > Console
2. Busca mensajes que empiecen con 📅
3. Verifica que "Hoy es pasado: false"

#### C. Soluciones Aplicadas
- ✅ Normalización de fechas corregida
- ✅ Auto-selección del día de hoy
- ✅ Validación de formulario mejorada

### 3. Error de hidratación HTML

**Error:**
```
In HTML, <div> cannot be a descendant of <p>
```

**Solución:** ✅ Ya solucionado - se cambió `<p>` por `<div>`

## 🔧 Comandos de Debug

### Verificar Estado del Proyecto
```bash
# 1. Verificar configuración
node scripts/verify-setup.js

# 2. Iniciar en modo desarrollo
npm run dev

# 3. Ver logs en tiempo real
# (abre la consola del navegador)
```

### Resetear Contador
Si necesitas resetear el contador a 0:
```sql
UPDATE contador_personas 
SET cantidad = 0 
WHERE local_id = 'TU_LOCAL_ID' 
AND fecha = CURRENT_DATE;
```

## 📞 Obtener Ayuda

Si los problemas persisten:

1. **Revisar logs completos:**
   - Consola del navegador (F12 > Console)
   - Terminal donde corre `npm run dev`

2. **Información útil para reportar:**
   - Mensaje de error exacto
   - Logs de la consola
   - Variables de entorno configuradas (sin mostrar valores reales)

3. **Verificar versiones:**
   ```bash
   node --version
   npm --version
   ```

## 🔍 Pasos de Diagnóstico

### Paso 1: Verificación Básica
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3000

# Verificar variables de entorno
echo $NEXT_PUBLIC_LOCAL_ID
```

### Paso 2: Test de Supabase
```javascript
// En la consola del navegador
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("Key existe:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Paso 3: Test Manual de Contador
```javascript
// En la consola del admin
import { updateContador } from '@/lib/storage'
await updateContador('tu_local_id', 10)
```

## ✅ Lista de Verificación

- [ ] `.env.local` existe y tiene todas las variables
- [ ] Supabase está configurado y las tablas existen
- [ ] Real-time está habilitado en Supabase
- [ ] LOCAL_ID coincide entre admin y frontend
- [ ] No hay errores en la consola del navegador
- [ ] El servidor de desarrollo está corriendo sin errores 