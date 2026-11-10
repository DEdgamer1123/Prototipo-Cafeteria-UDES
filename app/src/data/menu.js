// Datos del menú y configuración de cafeterías (fase prototipo — sin backend).
// isLunch: solo almuerzos permiten escoger hora de recogida.
// cafeteriaId: null = global (se muestra en las cafeterías que venden esa categoría).

// ============================================================
// CAFETERÍAS — nombres reales de la UDES
// Cafetería de las Flores: NO vende almuerzos ni desayunos.
// Desayunos: solo en la Cafetería de buses.
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

// ============================================================
// OPCIONES COMPARTIDAS
// ============================================================
const OPCION_PROTEINA = {
  id: 'proteina',
  label: 'Proteína',
  required: true,
  choices: [
    { id: 'carne', label: 'Carne a la plancha con chimichurri' },
    { id: 'lomitos', label: 'Lomitos de pollo apanados con miel naranjada' },
  ],
};

const OPCION_ACOMPANANTE = {
  id: 'acompanante',
  label: 'Acompañante',
  required: true,
  choices: [
    { id: 'sopa', label: 'Sopa de pastas' },
    { id: 'arroz', label: 'Arroz blanco' },
    { id: 'garbanzos', label: 'Garbanzos' },
    { id: 'ensalada', label: 'Ensalada de tomate y pepino' },
  ],
};

const OPCION_CAFE = {
  id: 'preparacion',
  label: 'Preparación',
  required: true,
  choices: [
    { id: 'americano', label: 'Americano', price: 3500 },
    { id: 'latte', label: 'Latte', price: 4500 },
    { id: 'capuchino', label: 'Capuchino', price: 5000 },
    { id: 'mocaccino', label: 'Mocaccino', price: 5500 },
  ],
};

const OPCION_AGUA_TAMANO = {
  id: 'tamano',
  label: 'Tamaño',
  required: true,
  choices: [
    { id: '300', label: '300 ml', price: 2000 },
    { id: '600', label: '600 ml', price: 3000 },
  ],
};

const OPCION_AGUA_GAS = {
  id: 'gas',
  label: 'Tipo de agua',
  required: true,
  choices: [
    { id: 'sin', label: 'Sin gas' },
    { id: 'con', label: 'Con gas' },
  ],
};

const OPCION_EMPANADA = {
  id: 'relleno',
  label: 'Relleno',
  required: true,
  choices: [
    { id: 'pollo', label: 'Pollo' },
    { id: 'carne', label: 'Carne' },
    { id: 'mixta', label: 'Mixta' },
  ],
};

// ============================================================
// CATÁLOGO
// ============================================================
export const MENU = [
  // --- Almuerzos fijos · Cafetería Yariguíes ---
  { id: 1, name: 'Costillas BBQ', description: 'Costillas BBQ con acompañante.', price: 15000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/costillas.jpg' },
  { id: 2, name: 'Pechuga a la plancha', description: 'Pechuga a la plancha con acompañante.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/pechuga-plancha.jpg' },
  { id: 3, name: 'Cerdo', description: 'Cerdo con acompañante.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/cerdo.jpg' },
  { id: 4, name: 'Alitas', description: 'Alitas con acompañamiento.', price: 13000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-2', image: '/img/productos/alitas.jpg' },

  // --- Desayunos (solo se muestran en la Cafetería de buses) ---
  { id: 6, name: 'Huevos Rancheros', description: 'Con arepa, queso y café americano.', price: 7500, category: 'desayunos', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: '/img/productos/huevos-rancheros.jpg' },
  { id: 40, name: 'Huevos Pericos', description: 'Huevos revueltos con tomate y cebolla, con arepa.', price: 7000, category: 'desayunos', isLunch: false, available: true, stock: 16, cafeteriaId: null, image: '/img/productos/huevos-pericos.jpg' },
  { id: 7, name: 'Sándwich de Pollo', description: 'Pan artesanal, pollo desmechado, lechuga y tomate.', price: 8500, category: 'desayunos', isLunch: false, available: true, stock: 14, cafeteriaId: null, image: '/img/productos/sandwich.jpg' },
  { id: 39, name: 'Sándwich de Jamón y Queso', description: 'Pan artesanal con jamón y queso fundido.', price: 7500, category: 'desayunos', isLunch: false, available: true, stock: 16, cafeteriaId: null, image: '/img/productos/sandwich-jamon.jpg' },

  // --- Bebidas (globales) ---
  { id: 9, name: 'Café', description: 'Elige tu preparación: americano, latte, capuchino o mocaccino.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/cafe.jpg', options: [OPCION_CAFE] },
  { id: 10, name: 'Jugo Natural', description: 'Mora, mango, lulo o maracuyá. En agua o leche.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 25, cafeteriaId: null, image: '/img/productos/jugo-natural.jpg' },
  { id: 11, name: 'Limonada de Coco', description: 'La clásica, cremosa y refrescante.', price: 5500, category: 'bebidas', isLunch: false, available: true, stock: 20, cafeteriaId: null, image: '/img/productos/limonada-coco.jpg' },
  { id: 12, name: 'Agua', description: 'Elige 300 ml o 600 ml y si la quieres con o sin gas.', price: 2000, category: 'bebidas', isLunch: false, available: true, stock: 60, cafeteriaId: null, image: '/img/productos/agua.jpg', options: [OPCION_AGUA_TAMANO, OPCION_AGUA_GAS] },
  { id: 13, name: 'Jugo Hit', description: 'Caja personal de jugo Hit.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 36, cafeteriaId: null, image: '/img/productos/jugo-hit.jpg' },
  { id: 14, name: 'Gaseosa Personal', description: 'Bien fría, sabores surtidos.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: '/img/productos/gaseosa.jpg' },
  { id: 16, name: 'Bebida Energizante', description: 'Lata personal 250 ml.', price: 6500, category: 'bebidas', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: '/img/productos/energizante.jpg' },

  // --- Snacks y tienda (globales) ---
  { id: 17, name: 'Empanada', description: 'Elige el relleno: pollo, carne o mixta.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/empanada.jpg', options: [OPCION_EMPANADA] },
  { id: 19, name: 'Papas Margarita', description: 'Paquete personal, sabor natural.', price: 3500, category: 'snacks', isLunch: false, available: true, stock: 45, cafeteriaId: null, image: '/img/productos/papas.jpg' },
  { id: 20, name: 'Chocorramo', description: 'Ponqué con cubierta de chocolate.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: '/img/productos/chocorramo.jpg' },
  { id: 21, name: 'Galletas Festival', description: 'Paquete de galletas surtidas.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 50, cafeteriaId: null, image: '/img/productos/galletas.jpg' },
  { id: 22, name: 'Chocolatina Jet', description: 'Barra de chocolate con leche.', price: 2500, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: '/img/productos/chocolate.jpg' },
  { id: 23, name: 'Maní', description: 'Paquete personal de maní tostado.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 35, cafeteriaId: null, image: '/img/productos/mani.jpg' },

  // --- Almuerzos del día · Cafetería de buses ---
  { id: 26, name: 'Almuerzo del día (mesa)', description: 'Sopa de pastas, arroz blanco, garbanzos, ensalada y proteína a elección.', price: 15000, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/almuerzo-ejecutivo.jpg', options: [OPCION_PROTEINA] },
  { id: 27, name: 'Almuerzo del día (para llevar)', description: 'Sopa de pastas, arroz blanco, garbanzos, ensalada y proteína a elección.', price: 17700, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/almuerzo-ejecutivo.jpg', options: [OPCION_PROTEINA] },
  { id: 28, name: 'Proteína + 1 acompañante (mesa)', description: 'Elige una proteína y un acompañante.', price: 11000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/pechuga-plancha.jpg', options: [OPCION_PROTEINA, OPCION_ACOMPANANTE] },
  { id: 29, name: 'Proteína + 1 acompañante (para llevar)', description: 'Elige una proteína y un acompañante.', price: 12600, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/pechuga-plancha.jpg', options: [OPCION_PROTEINA, OPCION_ACOMPANANTE] },
  { id: 30, name: 'Proteína', description: 'Porción de proteína: carne a la plancha con chimichurri o lomitos de pollo apanados con miel naranjada.', price: 7500, category: 'almuerzos', isLunch: false, available: true, stock: 12, cafeteriaId: 'caf-1', image: '/img/productos/carne-plancha.jpg', options: [OPCION_PROTEINA] },
  { id: 32, name: 'Sopa de pastas', description: 'Porción de sopa de pastas del día.', price: 5000, category: 'almuerzos', isLunch: false, available: true, stock: 20, cafeteriaId: 'caf-1', image: '/img/productos/sopa-pastas.jpg' },
  { id: 33, name: 'Arroz blanco', description: 'Porción de arroz blanco.', price: 3000, category: 'almuerzos', isLunch: false, available: true, stock: 25, cafeteriaId: 'caf-1', image: '/img/productos/arroz-blanco.jpg' },
  { id: 34, name: 'Ensalada de tomate y pepino', description: 'Rodajas de tomate y pepino.', price: 5000, category: 'almuerzos', isLunch: false, available: true, stock: 15, cafeteriaId: 'caf-1', image: '/img/productos/ensalada.jpg' },
  { id: 36, name: 'Jugo del día', description: 'Jugo natural del día.', price: 1500, category: 'bebidas', isLunch: false, available: true, stock: 25, cafeteriaId: 'caf-1', image: '/img/productos/jugo-natural.jpg' },

  // --- Almuerzos fijos · Yariguíes (continuación) ---
  { id: 37, name: 'Lasaña', description: 'Lasaña de la casa con acompañante.', price: 13000, category: 'almuerzos', isLunch: true, available: true, stock: 10, cafeteriaId: 'caf-2', image: '/img/productos/lasana.jpg' },
  { id: 38, name: 'Salchipapa', description: 'Salchipapa con papas y salchicha.', price: 10000, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: 'caf-2', image: '/img/productos/salchipapa.jpg' },
];

// Franjas de recogida para almuerzos (Ley de Hick: opciones limitadas y claras)
export const PICKUP_SLOTS = ['11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'];

// Minutos estimados de preparación por tipo de ítem (fallback si la cafetería no define)
export const MINUTOS_ALMUERZO = 8;
export const MINUTOS_OTRO = 5;

// Re-export desde el módulo único de dinero (fuente de verdad).
export { formatCOP } from '../lib/money';

export function cafeteriaPorId(id) {
  return CAFETERIAS.find((c) => c.id === id) ?? null;
}

/** Precio final según las opciones elegidas (una opción puede fijar el precio). */
export function precioConOpciones(product, seleccion = {}) {
  let price = product.price;
  for (const group of product.options ?? []) {
    const choice = group.choices.find((c) => c.id === seleccion[group.id]);
    if (choice && typeof choice.price === 'number') price = choice.price;
  }
  return price;
}

/** Texto legible de las opciones elegidas, ej. "1 litro · Sin gas". */
export function etiquetaOpciones(product, seleccion = {}) {
  const parts = [];
  for (const group of product.options ?? []) {
    const choice = group.choices.find((c) => c.id === seleccion[group.id]);
    if (choice) parts.push(choice.label);
  }
  return parts.join(' · ');
}

/** ¿Están elegidas todas las opciones obligatorias? */
export function opcionesCompletas(product, seleccion = {}) {
  return (product.options ?? []).every((g) => !g.required || Boolean(seleccion[g.id]));
}
