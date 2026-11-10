-- ============================================================
-- UDES Food — seed reproducible del catálogo base
-- 35 productos del prototipo (app/src/data/menu.js).
-- NO se siembran cafeterías: las crea el admin desde el panel
-- con los nombres reales de la UDES (decisión del plan, todo 40).
-- Las imágenes viven en app/public/img/productos y se migran a
-- Storage en el todo 7 (aquí imagen_url queda null).
-- ============================================================

insert into public.productos
  (id, cafeteria_id, nombre, descripcion, precio, categoria, es_almuerzo, disponible, stock, stock_reservado, imagen_url)
values
  ('00000000-0000-4000-8000-000000000001', null, 'Almuerzo Ejecutivo', 'Proteína del día, arroz, ensalada, sopa y jugo natural.', 12000, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000002', null, 'Almuerzo Vegetariano', 'Bowl de lentejas, quinoa, vegetales asados y jugo.', 11000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000003', null, 'Pechuga a la Plancha', 'Con puré de papa, ensalada fresca y limonada.', 14000, 'almuerzos', true, true, 10, 0, null),
  ('00000000-0000-4000-8000-000000000004', null, 'Combo Almuerzo + Bebida', 'Almuerzo ejecutivo con bebida de 400 ml a elección.', 15000, 'almuerzos', true, true, 10, 0, null),
  ('00000000-0000-4000-8000-000000000005', null, 'Calentado Paisa', 'Frijoles, arroz, huevo, arepa y chocolate.', 8000, 'desayunos', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000006', null, 'Huevos Rancheros', 'Con arepa, queso y café americano.', 7500, 'desayunos', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000007', null, 'Sándwich de Pollo', 'Pan artesanal, pollo desmechado, lechuga y tomate.', 8500, 'desayunos', false, true, 14, 0, null),
  ('00000000-0000-4000-8000-000000000008', null, 'Yogurt con Granola', 'Yogurt natural, granola y fruta de temporada.', 4500, 'desayunos', false, true, 16, 0, null),
  ('00000000-0000-4000-8000-000000000009', null, 'Café Latte', 'Café de origen colombiano con leche texturizada.', 4500, 'bebidas', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000010', null, 'Jugo Natural', 'Mora, mango, lulo o maracuyá. En agua o leche.', 4000, 'bebidas', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000011', null, 'Limonada de Coco', 'La clásica, cremosa y refrescante.', 5500, 'bebidas', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000012', null, 'Agua sin Gas 600 ml', 'Botella personal fría.', 3000, 'bebidas', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000013', null, 'Jugo Hit 500 ml', 'Caja personal, sabores surtidos.', 3500, 'bebidas', false, true, 36, 0, null),
  ('00000000-0000-4000-8000-000000000014', null, 'Gaseosa Personal 400 ml', 'Bien fría, sabores surtidos.', 4000, 'bebidas', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000015', null, 'Café Americano', 'Tinto de origen, tamaño mediano.', 3500, 'bebidas', false, true, 35, 0, null),
  ('00000000-0000-4000-8000-000000000016', null, 'Bebida Energizante', 'Lata personal 250 ml.', 6500, 'bebidas', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000017', null, 'Empanada de Pollo', 'Masa crocante con ají de la casa.', 3000, 'snacks', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000019', null, 'Papas Margarita', 'Paquete personal, sabor natural.', 3500, 'snacks', false, true, 45, 0, null),
  ('00000000-0000-4000-8000-000000000020', null, 'Chocorramo', 'Ponqué con cubierta de chocolate.', 3000, 'snacks', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000021', null, 'Galletas Festival', 'Paquete de galletas surtidas.', 2000, 'snacks', false, true, 50, 0, null),
  ('00000000-0000-4000-8000-000000000022', null, 'Chocolate Jet', 'Barra de chocolate con leche.', 2500, 'snacks', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000023', null, 'Maní Tostado', 'Bolsa personal de maní salado.', 2000, 'snacks', false, true, 35, 0, null),
  ('00000000-0000-4000-8000-000000000024', null, 'Obleas con Arequipe', 'Oblea artesanal con arequipe.', 2500, 'snacks', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000025', null, 'Paquete Surtido', 'Selección de 3 snacks de tienda.', 7500, 'snacks', false, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000026', null, 'Almuerzo del día (mesa)', 'Sopa de pastas, arroz blanco, garbanzos, tajadas de maduro, ensalada y proteína a elección.', 15000, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000027', null, 'Almuerzo del día (para llevar)', 'Sopa de pastas, arroz blanco, garbanzos, tajadas de maduro, ensalada y proteína a elección.', 13700, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000028', null, 'Proteína + 1 acompañante (mesa)', 'Carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada + un acompañante.', 11000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000029', null, 'Proteína + 1 acompañante (para llevar)', 'Carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada + un acompañante.', 12600, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000030', null, 'Carne a la plancha con chimichurri', 'Porción de carne a la plancha con chimichurri.', 7500, 'almuerzos', false, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000031', null, 'Lomitos de pollo apanados con miel naranjada', 'Porción de lomitos de pollo apanados con miel naranjada.', 7500, 'almuerzos', false, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000032', null, 'Sopa de pastas', 'Porción de sopa de pastas del día.', 5000, 'almuerzos', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000033', null, 'Arroz blanco', 'Porción de arroz blanco.', 3000, 'almuerzos', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000034', null, 'Ensalada de tomate y pepino', 'Rodajas de tomate y pepino.', 5000, 'almuerzos', false, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000035', null, 'Tajadas de maduro', 'Tajadas de plátano maduro.', 5000, 'almuerzos', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000036', null, 'Jugo del día', 'Jugo natural del día.', 1500, 'bebidas', false, true, 25, 0, null)
on conflict (id) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  categoria = excluded.categoria,
  es_almuerzo = excluded.es_almuerzo,
  stock = excluded.stock,
  disponible = excluded.disponible;
