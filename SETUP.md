# Configuración de la Base de Datos

## Pasos para configurar Supabase

### 1. Ejecutar el script SQL
Ve a tu panel de Supabase > SQL Editor y ejecuta el contenido del archivo `scripts/01-setup-database.sql`

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui

# ID del local (obtener después de ejecutar el script SQL)
NEXT_PUBLIC_LOCAL_ID=uuid_del_local_nocturnos
```

### 3. Obtener el LOCAL_ID
Después de ejecutar el script SQL, ejecuta esta consulta para obtener el ID del local:

```sql
SELECT id FROM locales WHERE slug = 'nocturnos';
```

Copia el UUID resultante y úsalo como `NEXT_PUBLIC_LOCAL_ID` en tu archivo `.env.local`

### 4. Verificar las tablas
Asegúrate de que se crearon estas tablas:
- `locales`
- `reservas` 
- `contador_personas`
- `usuarios_admin`

### 5. Agregar campo de contraseña (si ya tienes la tabla creada)
Si ya ejecutaste el script anterior y tienes la tabla `usuarios_admin` sin el campo `password`, ejecuta:
```sql
-- Script: scripts/03-add-password-field.sql
ALTER TABLE usuarios_admin ADD COLUMN IF NOT EXISTS password TEXT;
UPDATE usuarios_admin SET password = 'admin123' WHERE password IS NULL OR password = '';
ALTER TABLE usuarios_admin ALTER COLUMN password SET NOT NULL;
```

### 6. Crear usuario administrador
Ejecuta el script `scripts/02-create-admin.sql`:

1. **Obtener el ID del local:**
```sql
SELECT id FROM locales WHERE slug = 'nocturnos';
```

2. **Crear el admin** (reemplaza el UUID con el obtenido):
```sql
INSERT INTO usuarios_admin (
  local_id,
  nombre,
  email,
  password,
  token_acceso,
  rol
) VALUES (
  'TU_UUID_AQUI', -- Reemplaza con el UUID del local
  'Administrador Nocturnos',
  'admin@nocturnos.com',
  'admin123',
  'admin_token_inicial',
  'admin'
);
```

3. **Acceder al panel admin:**
Ve a: `http://localhost:3000/admin/login`

**Credenciales:**
- Email: `admin@nocturnos.com`
- Contraseña: `admin123`

## Panel de Administración

El panel de admin incluye:
- ✅ **Contador en vivo**: Actualizar número de personas en el local
- ✅ **Lista de reservas**: Ver todas las reservas con estado
- ✅ **Descargar CSV**: Exportar reservas a Excel
- ✅ **Filtros por estado**: Hoy, próximas, pasadas

## Problemas comunes

### Error 404 en /rest/v1/reservas
- Verifica que la tabla `reservas` existe
- Verifica que las políticas RLS están configuradas correctamente

### Error de variables de entorno
- Asegúrate de que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de cambiar las variables

### No puedo acceder al admin
- Verifica que el token es correcto
- Asegúrate de que el usuario admin existe en la base de datos
- Revisa que el `local_id` del admin coincida con el local creado 