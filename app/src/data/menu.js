// Datos del menú y configuración de cafeterías (fase prototipo — sin backend).
// isLunch: solo almuerzos permiten escoger hora de recogida.

// ============================================================
// CAFETERÍAS — nombres reales de la UDES
// Cafetería de las Flores: NO vende almuerzos ni desayunos.
// `sede` queda vacía: la ubicación real se puede añadir después.
// ============================================================
export const CAFETERIAS = [
  {
    id: 'caf-1',
    nombre: 'Cafetería de buses',
    sede: '',
    vendeAlmuerzos: true,
    vendeDesayunos: true,
    horarioApertura: '11:00',
    horarioCierre: '15:00',
    // Entrega confirmada: 2 minutos por almuerzo -> 7 por franja de 15 min
    minutosPorAlmuerzo: 2,
    cupoPorFranja: 7,
  },
  {
    id: 'caf-2',
    nombre: 'Cafetería Yariguíes',
    sede: '',
    vendeAlmuerzos: true,
    vendeDesayunos: false,
    horarioApertura: '11:00',
    horarioCierre: '15:00',
    // 20 minutos por 5 almuerzos -> 4 minutos por almuerzo -> 3 por franja
    minutosPorAlmuerzo: 4,
    cupoPorFranja: 3,
  },
  {
    id: 'caf-3',
    nombre: 'Cafetería de las Flores',
    sede: '',
    vendeAlmuerzos: false,
    vendeDesayunos: false,
    horarioApertura: '11:00',
    horarioCierre: '14:30',
    minutosPorAlmuerzo: null,
    cupoPorFranja: 12,
  },
];

export const CATEGORIES = [
  { id: 'almuerzos', label: 'Almuerzos' },
  { id: 'desayunos', label: 'Desayunos' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'snacks', label: 'Snacks y tienda' },
];

// cafeteriaId: null = disponible en todas las cafeterías activas.
export const MENU = [
  // --- Almuerzos ---
  { id: 1, name: 'Costillas BBQ', description: 'Costillas BBQ con acompañante.', price: 15000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/costillas.jpg' },
  { id: 2, name: 'Pechuga a la plancha', description: 'Pechuga a la plancha con acompañante.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/pechuga-plancha.jpg' },
  { id: 3, name: 'Cerdo', description: 'Cerdo con acompañante.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/cerdo.jpg' },
  { id: 4, name: 'Alitas', description: 'Alitas con acompañamiento.', price: 13000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/alitas.jpg' },

  // --- Desayunos ---
  { id: 5, name: 'Calentado Paisa', description: 'Frijoles, arroz, huevo, arepa y chocolate.', price: 8000, category: 'desayunos', isLunch: false, available: true, stock: 20, cafeteriaId: null, image: '/img/productos/calentado-paisa.jpg' },
  { id: 6, name: 'Huevos Rancheros', description: 'Con arepa, queso y café americano.', price: 7500, category: 'desayunos', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: '/img/productos/huevos-rancheros.jpg' },
  { id: 7, name: 'Sándwich de Pollo', description: 'Pan artesanal, pollo desmechado, lechuga y tomate.', price: 8500, category: 'desayunos', isLunch: false, available: true, stock: 14, cafeteriaId: null, image: '/img/productos/sandwich.jpg' },
  { id: 8, name: 'Yogurt con Granola', description: 'Yogurt natural, granola y fruta de temporada.', price: 4500, category: 'desayunos', isLunch: false, available: true, stock: 16, cafeteriaId: null, image: '/img/productos/yogurt.jpg' },

  // --- Bebidas ---
  { id: 9, name: 'Café Latte', description: 'Café de origen colombiano con leche texturizada.', price: 4500, category: 'bebidas', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: '/img/productos/cafe-latte.jpg' },
  { id: 10, name: 'Jugo Natural', description: 'Mora, mango, lulo o maracuyá. En agua o leche.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 25, cafeteriaId: null, image: '/img/productos/jugo-natural.jpg' },
  { id: 11, name: 'Limonada de Coco', description: 'La clásica, cremosa y refrescante.', price: 5500, category: 'bebidas', isLunch: false, available: true, stock: 20, cafeteriaId: null, image: '/img/productos/limonada-coco.jpg' },
  { id: 12, name: 'Agua sin Gas 600 ml', description: 'Botella personal fría.', price: 3000, category: 'bebidas', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/agua.jpg' },
  { id: 13, name: 'Jugo Hit 500 ml', description: 'Caja personal, sabores surtidos.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 36, cafeteriaId: null, image: '/img/productos/jugo.jpg' },
  { id: 14, name: 'Gaseosa Personal 400 ml', description: 'Bien fría, sabores surtidos.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: '/img/productos/gaseosa.jpg' },
  { id: 15, name: 'Café Americano', description: 'Tinto de origen, tamaño mediano.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 35, cafeteriaId: null, image: '/img/productos/cafe.jpg' },
  { id: 16, name: 'Bebida Energizante', description: 'Lata personal 250 ml.', price: 6500, category: 'bebidas', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: '/img/productos/energizante.jpg' },

  // --- Snacks y tienda ---
  { id: 17, name: 'Empanada de Pollo', description: 'Masa crocante con ají de la casa.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/empanada.jpg' },
  { id: 19, name: 'Papas Margarita', description: 'Paquete personal, sabor natural.', price: 3500, category: 'snacks', isLunch: false, available: true, stock: 45, cafeteriaId: null, image: '/img/productos/papas.jpg' },
  { id: 20, name: 'Chocorramo', description: 'Ponqué con cubierta de chocolate.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: '/img/productos/chocorramo.jpg' },
  { id: 21, name: 'Galletas Festival', description: 'Paquete de galletas surtidas.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 50, cafeteriaId: null, image: '/img/productos/galletas.jpg' },
  { id: 22, name: 'Chocolate Jet', description: 'Barra de chocolate con leche.', price: 2500, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/chocolate.jpg' },
  { id: 23, name: 'Maní Tostado', description: 'Bolsa personal de maní salado.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 35, cafeteriaId: null, image: '/img/productos/mani.jpg' },
  { id: 24, name: 'Obleas con Arequipe', description: 'Oblea artesanal con arequipe.', price: 2500, category: 'snacks', isLunch: false, available: true, stock: 25, cafeteriaId: null, image: '/img/productos/obleas.jpg' },
  { id: 25, name: 'Paquete Surtido', description: 'Selección de 3 snacks de tienda.', price: 7500, category: 'snacks', isLunch: false, available: true, stock: 12, cafeteriaId: null, image: '/img/productos/surtido.jpg' },
  // --- Menú del día · Cafetería de buses (tablero) ---
  { id: 26, name: 'Almuerzo del día (mesa)', description: 'Sopa de pastas, arroz blanco, garbanzos, tajadas de maduro, ensalada y proteína a elección.', price: 15000, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/almuerzo-ejecutivo.jpg' },
  { id: 27, name: 'Almuerzo del día (para llevar)', description: 'Sopa de pastas, arroz blanco, garbanzos, tajadas de maduro, ensalada y proteína a elección.', price: 13700, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/almuerzo-ejecutivo.jpg' },
  { id: 28, name: 'Proteína + 1 acompañante (mesa)', description: 'Carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada + un acompañante.', price: 11000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/pechuga-plancha.jpg' },
  { id: 29, name: 'Proteína + 1 acompañante (para llevar)', description: 'Carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada + un acompañante.', price: 12600, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/pechuga-plancha.jpg' },
  { id: 30, name: 'Carne a la plancha con chimichurri', description: 'Porción de carne a la plancha con chimichurri.', price: 7500, category: 'almuerzos', isLunch: false, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/carne-plancha.jpg' },
  { id: 31, name: 'Lomitos de pollo apanados con miel naranjada', description: 'Porción de lomitos de pollo apanados con miel naranjada.', price: 7500, category: 'almuerzos', isLunch: false, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/lomitos-pollo.jpg' },
  { id: 32, name: 'Sopa de pastas', description: 'Porción de sopa de pastas del día.', price: 5000, category: 'almuerzos', isLunch: false, available: true, stock: 20, cafeteriaId: 'caf-1', image: '/img/productos/sopa-pastas.jpg' },
  { id: 33, name: 'Arroz blanco', description: 'Porción de arroz blanco.', price: 3000, category: 'almuerzos', isLunch: false, available: true, stock: 25, cafeteriaId: 'caf-1', image: '/img/productos/arroz-blanco.jpg' },
  { id: 34, name: 'Ensalada de tomate y pepino', description: 'Rodajas de tomate y pepino.', price: 5000, category: 'almuerzos', isLunch: false, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/ensalada.jpg' },
  { id: 35, name: 'Tajadas de maduro', description: 'Tajadas de plátano maduro.', price: 5000, category: 'almuerzos', isLunch: false, available: true, stock: 18, cafeteriaId: 'caf-1', image: '/img/productos/tajadas-maduro.jpg' },
  { id: 36, name: 'Jugo del día', description: 'Jugo natural del día.', price: 1500, category: 'bebidas', isLunch: false, available: true, stock: 25, cafeteriaId: 'caf-1', image: '/img/productos/jugo-natural.jpg' },
  { id: 37, name: 'Lasaña', description: 'Lasaña de la casa con acompañante.', price: 13000, category: 'almuerzos', isLunch: true, available: true, stock: 10, cafeteriaId: 'caf-2', image: '/img/productos/lasana.jpg' },
  { id: 38, name: 'Salchipapa', description: 'Salchipapa con papas y salchicha.', price: 10000, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-2', image: '/img/productos/salchipapa.jpg' },
];

// Franjas de recogida para almuerzos (Ley de Hick: opciones limitadas y claras)
export const PICKUP_SLOTS = ['11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'];

// Minutos estimados de preparación por tipo de ítem (para el cálculo de cola)
export const MINUTOS_ALMUERZO = 8;
export const MINUTOS_OTRO = 5;

// Re-export desde el módulo único de dinero (fuente de verdad).
export { formatCOP } from '../lib/money';

export function cafeteriaPorId(id) {
  return CAFETERIAS.find((c) => c.id === id) ?? null;
}
