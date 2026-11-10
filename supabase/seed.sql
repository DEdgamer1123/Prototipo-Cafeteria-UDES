-- ============================================================
-- UDES Food — seed reproducible del catálogo base
-- 33 productos del prototipo (app/src/data/menu.js).
-- NO se siembran cafeterías: las crea el admin desde el panel
-- con los nombres reales de la UDES (decisión del plan, todo 40).
-- Las imágenes viven en app/public/img/productos y se migran a
-- Storage en el todo 7 (aquí imagen_url queda null).
-- ============================================================

insert into public.productos
  (id, cafeteria_id, nombre, descripcion, precio, categoria, es_almuerzo, disponible, stock, stock_reservado, imagen_url)
values
  ('00000000-0000-4000-8000-000000000001', null, 'Costillas BBQ', 'Costillas BBQ con acompañante.', 15000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000002', null, 'Pechuga a la plancha', 'Pechuga a la plancha con acompañante.', 14000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000003', null, 'Cerdo', 'Cerdo con acompañante.', 14000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000004', null, 'Alitas', 'Alitas con acompañamiento.', 13000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000005', null, 'Calentado Paisa', 'Frijoles, arroz, huevo, arepa y chocolate.', 8000, 'desayunos', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000006', null, 'Huevos Rancheros', 'Con arepa, queso y café americano.', 7500, 'desayunos', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000007', null, 'Sándwich de Pollo', 'Pan artesanal, pollo desmechado, lechuga y tomate.', 8500, 'desayunos', false, true, 14, 0, null),
  ('00000000-0000-4000-8000-000000000008', null, 'Yogurt con Granola', 'Yogurt natural, granola y fruta de temporada.', 4500, 'desayunos', false, true, 16, 0, null),
  ('00000000-0000-4000-8000-000000000009', null, 'Café', 'Elige tu preparación: americano, latte, capuchino o mocaccino.', 3500, 'bebidas', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000010', null, 'Jugo Natural', 'Mora, mango, lulo o maracuyá. En agua o leche.', 4000, 'bebidas', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000011', null, 'Limonada de Coco', 'La clásica, cremosa y refrescante.', 5500, 'bebidas', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000012', null, 'Agua', 'Elige 300 ml o 600 ml y si la quieres con o sin gas.', 2000, 'bebidas', false, true, 60, 0, null),
  ('00000000-0000-4000-8000-000000000013', null, 'Jugo Hit', 'Caja personal de jugo Hit.', 3500, 'bebidas', false, true, 36, 0, null),
  ('00000000-0000-4000-8000-000000000014', null, 'Gaseosa Personal', 'Bien fría, sabores surtidos.', 4000, 'bebidas', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000016', null, 'Bebida Energizante', 'Lata personal 250 ml.', 6500, 'bebidas', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000017', null, 'Empanada', 'Elige el relleno: pollo, carne o mixta.', 3000, 'snacks', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000019', null, 'Papas Margarita', 'Paquete personal, sabor natural.', 3500, 'snacks', false, true, 45, 0, null),
  ('00000000-0000-4000-8000-000000000020', null, 'Chocorramo', 'Ponqué con cubierta de chocolate.', 3000, 'snacks', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000021', null, 'Galletas Festival', 'Paquete de galletas surtidas.', 2000, 'snacks', false, true, 50, 0, null),
  ('00000000-0000-4000-8000-000000000022', null, 'Chocolatina Jet', 'Barra de chocolate con leche.', 2500, 'snacks', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000023', null, 'Maní Tostado', 'Bolsa personal de maní salado.', 2000, 'snacks', false, true, 35, 0, null),
  ('00000000-0000-4000-8000-000000000025', null, 'Paquetes', 'Elige el paquete de tienda que quieras.', 2000, 'snacks', false, true, 60, 0, null),
  ('00000000-0000-4000-8000-000000000026', null, 'Almuerzo del día (mesa)', 'Sopa de pastas, arroz blanco, garbanzos, ensalada y proteína a elección.', 15000, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000027', null, 'Almuerzo del día (para llevar)', 'Sopa de pastas, arroz blanco, garbanzos, ensalada y proteína a elección.', 17700, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000028', null, 'Proteína + 1 acompañante (mesa)', 'Elige una proteína y un acompañante.', 11000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000029', null, 'Proteína + 1 acompañante (para llevar)', 'Elige una proteína y un acompañante.', 12600, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000030', null, 'Proteína', 'Porción de proteína: carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada.', 7500, 'almuerzos', false, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000032', null, 'Sopa de pastas', 'Porción de sopa de pastas del día.', 5000, 'almuerzos', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000033', null, 'Arroz blanco', 'Porción de arroz blanco.', 3000, 'almuerzos', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000034', null, 'Ensalada de tomate y pepino', 'Rodajas de tomate y pepino.', 5000, 'almuerzos', false, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000036', null, 'Jugo del día', 'Jugo natural del día.', 1500, 'bebidas', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000037', null, 'Lasaña', 'Lasaña de la casa con acompañante.', 13000, 'almuerzos', true, true, 10, 0, null),
  ('00000000-0000-4000-8000-000000000038', null, 'Salchipapa', 'Salchipapa con papas y salchicha.', 10000, 'almuerzos', true, true, 15, 0, null)
on conflict (id) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  categoria = excluded.categoria,
  es_almuerzo = excluded.es_almuerzo,
  stock = excluded.stock,
  disponible = excluded.disponible;
