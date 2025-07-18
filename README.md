# Bar Boliche Landing - Nocturnos

Sistema de reservas y contador en vivo para bar/boliche.

## 🚀 Configuración Inicial

### 1. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui

# ID del local (obtener después de ejecutar el script SQL)
NEXT_PUBLIC_LOCAL_ID=uuid_del_local_nocturnos
```

### 2. Verificar Configuración
```bash
# Ejecutar script de verificación
node scripts/verify-setup.js

# Test de fechas
node scripts/test-dates.js
```

### 3. Iniciar el Proyecto
```bash
npm install
npm run dev
```

## 📊 Contador en Vivo

### Cuándo se Muestra
- **Desarrollo**: Siempre visible en localhost
- **Producción**: Desde las 19:00 hasta las 06:00

### Funcionamiento
- Se actualiza automáticamente desde el admin
- Sincronización en tiempo real con Supabase
- Respaldo: actualización cada 30 segundos

### Para Probar Ahora (Modo Desarrollo)
1. Ve a: `http://localhost:3000`
2. El contador debería aparecer al final de la página
3. Ve al admin: `http://localhost:3000/admin`
4. Cambia el contador con los botones +/-
5. Verifica que se actualiza en tiempo real en la página principal

## 🔧 Debug del Contador

### Verificar en la Consola (F12)
Busca estos logs:
```
🔄 Cargando contador para LOCAL_ID: local_test_001
📊 Cantidad recibida del servidor: 5
✅ Estado actualizado en frontend: 5
📡 Estado suscripción contador: SUBSCRIBED
```

### Si No Funciona
1. **Variables no configuradas**:
   ```
   ❌ NEXT_PUBLIC_LOCAL_ID no está configurado
   ```
   - Configura las variables en `.env.local`

2. **No se ve el contador**:
   - En desarrollo debería estar siempre visible
   - En producción solo entre 19:00-06:00

3. **No se actualiza**:
   - Verifica que Real-time esté habilitado en Supabase
   - Revisa logs de la consola para errores

## 📖 Documentación Adicional

- `SETUP.md` - Configuración de base de datos
- `TROUBLESHOOTING.md` - Guía de solución de problemas

## 🏗️ Estructura del Proyecto

```
├── app/
│   ├── page.tsx              # Página principal
│   └── admin/               # Panel de administración
├── components/
│   ├── live-counter.tsx     # Contador en vivo
│   ├── reservation-form.tsx # Formulario de reservas
│   └── reservation-calendar.tsx # Calendario
├── lib/
│   ├── storage.ts          # Funciones de base de datos
│   └── supabase.ts         # Cliente de Supabase
└── scripts/
    ├── verify-setup.js     # Verificar configuración
    └── test-dates.js       # Test de fechas
``` #   s i s t e m a - b a r  
 #   D e p l o y   w i t h   o p t i m i z a t i o n s   -   0 7 / 1 6 / 2 0 2 5   2 0 : 3 9 : 4 6  
 