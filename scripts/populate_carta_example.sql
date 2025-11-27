-- Script para poblar la carta con datos de ejemplo basados en las imágenes de Eleven Club
-- Ejecutar después de create_carta_tables.sql

-- Limpiar datos existentes (opcional)
-- DELETE FROM items_carta WHERE local_id = 'eleven-club';
-- DELETE FROM categorias_carta WHERE local_id = 'eleven-club';

-- ============================================
-- CATEGORÍAS
-- ============================================

INSERT INTO categorias_carta (nombre, orden, local_id) VALUES
('Cocktails de firma', 0, 'eleven-club'),
('Eternos', 1, 'eleven-club'),
('Aperitivos y Vermut', 2, 'eleven-club'),
('Spritz Season', 3, 'eleven-club'),
('Delicias Selectas', 4, 'eleven-club'),
('Negronis de la Casa', 5, 'eleven-club'),
('Whisky Escocés', 6, 'eleven-club'),
('Whisky Irlandés', 7, 'eleven-club'),
('American Whisky - Kentucky', 8, 'eleven-club'),
('Tennessee', 9, 'eleven-club'),
('Gin', 10, 'eleven-club'),
('Ron', 11, 'eleven-club'),
('Servicio de botella', 12, 'eleven-club'),
('Champagne', 13, 'eleven-club'),
('Espumantes', 14, 'eleven-club'),
('Cervezas', 15, 'eleven-club'),
('Vinos', 16, 'eleven-club'),
('Mocktails', 17, 'eleven-club'),
('Aguas Nacionales', 18, 'eleven-club'),
('Aguas Importadas', 19, 'eleven-club'),
('Refrescos', 20, 'eleven-club')
ON CONFLICT (nombre, local_id) DO NOTHING;

-- ============================================
-- COCKTAILS DE FIRMA
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Genesis',
  'Vermut Tempestad, Tequila José Cuervo, Don mix, azahar.',
  15.000,
  0,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Badasserie',
  'Gin Bulldog, almíbar, Albúmina, limón, wasabi.',
  15.000,
  1,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Elixir',
  'Chivas 12 años, miel, jengibre, pomelo.',
  15.000,
  2,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Dolce Passaglia',
  'Ron Havana Club añejo, Frangelico, arándanos, lima, cacao, Franui.',
  15.000,
  3,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Delirio Escocés',
  'Johnnie Walker Black, frambuesas, hibisco, bitter de cacao y nuez.',
  15.000,
  4,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Reishi Martini',
  'Gin Bulldog, Reishi, oliva Zuelo Novello, limón.',
  15.000,
  5,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Osara Havana',
  'Havana Club mix, frutos rojos, hongo Shiitake y ají, limón, pomelo.',
  15.000,
  6,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Veris y Elegante',
  'Wild Turkey, azúcar de avellanas, bitter angostura, bitter de coco.',
  15.000,
  7,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Sencha',
  'Vodka Absolut, tremella, limón, sencha, hibiscus.',
  15.000,
  8,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Abraxas',
  'Ron Havana Club Mix, orgeat, lima, limón, Vermut.',
  15.000,
  9,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Once',
  'Gin Bulldog, Pelargonium, limón, Aperol, jengibre, pomelo.',
  15.000,
  10,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';

-- ============================================
-- ETERNOS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Negroni', NULL, 10.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Gin tonic (bulldog)', NULL, 10.000, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Old fashioned', NULL, 14.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Martini', NULL, 10.000, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Manhattan', NULL, 10.000, 4, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Tom Collins', NULL, 10.000, 5, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Gimlet', NULL, 10.000, 6, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Bloody Mary', NULL, 15.000, 7, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Daiquiri Cocktail', NULL, 10.000, 8, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Mint Julep', NULL, 10.000, 9, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Eternos' AND c.local_id = 'eleven-club';

-- ============================================
-- APERITIVOS Y VERMUT
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Mi-To', NULL, 10.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Americano', NULL, 10.000, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Campari tonic', NULL, 8.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Cynar 70', NULL, 8.000, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Cinzano Rosso', NULL, 8.000, 4, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Vermut Tempestad', NULL, 9.000, 5, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Vermut Tempestad de Bardo lata', NULL, 8.000, 6, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Amaro Averna', NULL, 8.000, 7, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Jägermeister', NULL, 8.000, 8, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aperitivos y Vermut' AND c.local_id = 'eleven-club';

-- ============================================
-- SPRITZ SEASON
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Aperol Spritz', NULL, 12.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Spritz Season' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Campari Spritz', NULL, 12.000, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Spritz Season' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Cynar Spritz', NULL, 12.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Spritz Season' AND c.local_id = 'eleven-club';

-- ============================================
-- DELICIAS SELECTAS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Verduras marinadas con pan orgánico', 'Berenjenas asadas, tomates y verduras marinadas alineados con oliva extra virgen, pesto y pan.', 10.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Delicias Selectas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Jamón serrano con pan orgánico y Stracciatella', 'Tostón con stracciatella, láminas de jamón de 14 meses y brotes de rúcula salvaje.', 12.000, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Delicias Selectas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Ración de quesos blancos y duros', 'Cortes de quesos artesanales acompañados de rodaja de pan.', 12.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Delicias Selectas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Papas Gauchitas', 'Papas Gauchitas, láminas de jamón serrano y escamas de charqui del Noroeste Argentino y mayonesa ahumada.', 8.000, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Delicias Selectas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Grigolas', 'Hongos grigola salteados con aceite de sésamo, jengibre y salsa de soja.', 12.000, 4, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Delicias Selectas' AND c.local_id = 'eleven-club';

-- ============================================
-- GIN
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Bulldog', NULL, 10.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Bombay', NULL, 15.000, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Citadelle', NULL, 17.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Monkey 47', NULL, 26.000, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Martin Miller''s', NULL, 18.000, 4, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Hendricks', NULL, 15.000, 5, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Hendricks Flora Adora', NULL, 17.000, 6, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Malfy', NULL, 16.000, 7, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Malfy limone', NULL, 17.000, 8, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Gin' AND c.local_id = 'eleven-club';

-- ============================================
-- CERVEZAS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Budweiser', NULL, 5.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Cervezas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Corona', NULL, 6.500, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Cervezas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Corona Cero', NULL, 4.000, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Cervezas' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Stella Artois', NULL, 6.500, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Cervezas' AND c.local_id = 'eleven-club';

-- ============================================
-- MOCKTAILS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Cocktail sin alcohol', NULL, 12.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Mocktails' AND c.local_id = 'eleven-club';

-- ============================================
-- AGUAS NACIONALES
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Eco sin gas', NULL, 3.500, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aguas Nacionales' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Eco con gas', NULL, 3.500, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aguas Nacionales' AND c.local_id = 'eleven-club';

-- ============================================
-- AGUAS IMPORTADAS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Perrier', NULL, 7.000, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Aguas Importadas' AND c.local_id = 'eleven-club';

-- ============================================
-- REFRESCOS
-- ============================================

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Pepsi', NULL, 3.500, 0, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Refrescos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, '7up', NULL, 3.500, 1, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Refrescos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Agua tónica Paso de los Toros', NULL, 3.500, 2, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Refrescos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Agua tónica Britvic', NULL, 4.500, 3, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Refrescos' AND c.local_id = 'eleven-club';

INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT c.id, 'Red Bull', NULL, 9.500, 4, 'eleven-club'
FROM categorias_carta c WHERE c.nombre = 'Refrescos' AND c.local_id = 'eleven-club';

-- Verificar que se insertaron correctamente
SELECT 
  c.nombre as categoria,
  COUNT(i.id) as total_items
FROM categorias_carta c
LEFT JOIN items_carta i ON c.id = i.categoria_id
WHERE c.local_id = 'eleven-club'
GROUP BY c.nombre, c.orden
ORDER BY c.orden;
