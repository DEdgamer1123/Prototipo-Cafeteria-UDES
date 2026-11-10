-- ============================================================
-- UDES Food — seed reproducible del catálogo base
-- 10 productos del prototipo (app/src/data/menu.js:11-22).
-- NO se siembran cafeterías: las crea el admin desde el panel
-- con los nombres reales de la UDES (decisión del plan, todo 40).
-- Las imágenes se asignan al migrarlas a Storage (todo 7).
-- ============================================================

insert into public.productos
  (id, cafeteria_id, nombre, descripcion, precio, categoria, es_almuerzo, disponible, stock, stock_reservado, imagen_url)
values
  ('00000000-0000-4000-8000-000000000001', null, 'Almuerzo Ejecutivo', 'Proteina del dia, arroz, ensalada, sopa y jugo natural.', 12000, 'almuerzos', true, true, 15, 0, null),
  ('00000000-0000-4000-8000-000000000002', null, 'Almuerzo Vegetariano', 'Bowl de lentejas, quinoa, vegetales asados y jugo.', 11000, 'almuerzos', true, true, 12, 0, null),
  ('00000000-0000-4000-8000-000000000003', null, 'Pechuga a la Plancha', 'Con pure de papa, ensalada fresca y limonada.', 14000, 'almuerzos', true, true, 10, 0, null),
  ('00000000-0000-4000-8000-000000000004', null, 'Calentado Paisa', 'Frijoles, arroz, huevo, arepa y chocolate.', 8000, 'desayunos', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000005', null, 'Huevos Rancheros', 'Con arepa, queso y cafe americano.', 7500, 'desayunos', false, true, 18, 0, null),
  ('00000000-0000-4000-8000-000000000006', null, 'Cafe Latte', 'Cafe de origen colombiano con leche texturizada.', 4500, 'bebidas', false, true, 30, 0, null),
  ('00000000-0000-4000-8000-000000000007', null, 'Jugo Natural', 'Mora, mango, lulo o maracuya. En agua o leche.', 4000, 'bebidas', false, true, 25, 0, null),
  ('00000000-0000-4000-8000-000000000008', null, 'Limonada de Coco', 'La clasica, cremosa y refrescante.', 5500, 'bebidas', false, true, 20, 0, null),
  ('00000000-0000-4000-8000-000000000009', null, 'Empanada de Pollo', 'Masa crocante con aji de la casa.', 3000, 'snacks', false, true, 40, 0, null),
  ('00000000-0000-4000-8000-000000000010', null, 'Brownie con Helado', 'Brownie tibio con bola de vainilla.', 6000, 'snacks', false, true, 8, 0, null)
on conflict (id) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  categoria = excluded.categoria,
  es_almuerzo = excluded.es_almuerzo,
  stock = excluded.stock,
  disponible = excluded.disponible;
