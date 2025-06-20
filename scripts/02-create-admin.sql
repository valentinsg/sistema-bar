-- Script para crear un usuario administrador

-- Primero, obtener el ID del local 'nocturnos'
-- (Ejecuta esta consulta primero para obtener el local_id)
-- SELECT id FROM locales WHERE slug = 'nocturnos';

-- Luego, reemplaza 'LOCAL_ID_AQUI' con el UUID obtenido y ejecuta:

INSERT INTO usuarios_admin (
  local_id,
  nombre,
  email,
  password,
  rol
) VALUES (
  '4784028b-97c4-48e2-a106-1111ecee4b1a', -- Reemplaza con el UUID del local
  'Administrador Nocturnos',
  'admin@nocturnos.com',
  'admin123', -- Contraseña en texto plano (en producción usar hash)
  'admin'
);
-- NOTA: No incluimos token_acceso porque se generará automáticamente en el login

-- Para verificar que se creó correctamente:
-- SELECT nombre, email FROM usuarios_admin WHERE email = 'admin@nocturnos.com';

-- CREDENCIALES DE ACCESO:
-- URL: http://localhost:3000/admin/login
-- Email: admin@nocturnos.com
-- Contraseña: admin123

-- INSTRUCCIONES:
-- 1. Ejecuta: SELECT id FROM locales WHERE slug = 'nocturnos';
-- 2. Copia el UUID resultado
-- 3. Reemplaza 'LOCAL_ID_AQUI' arriba con ese UUID
-- 4. Ejecuta el INSERT
-- 5. Ve a http://localhost:3000/admin/login
-- 6. Usa las credenciales: admin@nocturnos.com / admin123 