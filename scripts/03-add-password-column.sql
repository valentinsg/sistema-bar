-- Script para agregar la columna password a la tabla usuarios_admin existente

-- 1. Agregar la columna password
ALTER TABLE usuarios_admin 
ADD COLUMN password TEXT;

-- 2. Actualizar usuarios existentes con la contraseña por defecto
UPDATE usuarios_admin 
SET password = 'admin123' 
WHERE password IS NULL;

-- 3. Hacer que el campo sea obligatorio
ALTER TABLE usuarios_admin 
ALTER COLUMN password SET NOT NULL;

-- 4. Verificar que se agregó correctamente
SELECT nombre, email, password FROM usuarios_admin;

-- NOTA: Todos los usuarios admin existentes ahora tendrán la contraseña 'admin123'
-- Puedes cambiarla ejecutando:
-- UPDATE usuarios_admin SET password = 'nueva_contraseña' WHERE email = 'admin@nocturnos.com'; 