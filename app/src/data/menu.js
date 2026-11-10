// Datos del menú y configuración de cafeterías (fase prototipo — sin backend).
// isLunch: solo almuerzos permiten escoger hora de recogida.

// ============================================================
// CAFETERÍAS — NOMBRES PLACEHOLDER
// Reemplazar `nombre` y `sede` cuando el usuario entregue los
// nombres reales de las 3 cafeterías de la UDES. La tercera
// NO vende almuerzos (regla de negocio acordada).
// ============================================================
export const CAFETERIAS = [
  {
    id: 'caf-1',
    nombre: 'Cafetería 1',
    sede: 'Sede principal',
    vendeAlmuerzos: true,
    horarioApertura: '11:00',
    horarioCierre: '15:00',
    cupoPorFranja: 20,
  },
  {
    id: 'caf-2',
    nombre: 'Cafetería 2',
    sede: 'Bloque B',
    vendeAlmuerzos: true,
    horarioApertura: '11:00',
    horarioCierre: '15:00',
    cupoPorFranja: 15,
  },
  {
    id: 'caf-3',
    nombre: 'Cafetería 3',
    sede: 'Bloque C',
    vendeAlmuerzos: false,
    horarioApertura: '11:00',
    horarioCierre: '14:30',
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
  { id: 1, name: 'Almuerzo Ejecutivo', description: 'Proteína del día, arroz, ensalada, sopa y jugo natural.', price: 12000, category: 'almuerzos', isLunch: true, available: true, stock: 15, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70' },
  { id: 2, name: 'Almuerzo Vegetariano', description: 'Bowl de lentejas, quinoa, vegetales asados y jugo.', price: 11000, category: 'almuerzos', isLunch: true, available: true, stock: 12, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=70' },
  { id: 3, name: 'Pechuga a la Plancha', description: 'Con puré de papa, ensalada fresca y limonada.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 10, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=70' },
  { id: 4, name: 'Combo Almuerzo + Bebida', description: 'Almuerzo ejecutivo con bebida de 400 ml a elección.', price: 15000, category: 'almuerzos', isLunch: true, available: true, stock: 10, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70' },

  // --- Desayunos ---
  { id: 5, name: 'Calentado Paisa', description: 'Frijoles, arroz, huevo, arepa y chocolate.', price: 8000, category: 'desayunos', isLunch: false, available: true, stock: 20, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=70' },
  { id: 6, name: 'Huevos Rancheros', description: 'Con arepa, queso y café americano.', price: 7500, category: 'desayunos', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=70' },
  { id: 7, name: 'Sándwich de Pollo', description: 'Pan artesanal, pollo desmechado, lechuga y tomate.', price: 8500, category: 'desayunos', isLunch: false, available: true, stock: 14, cafeteriaId: null, image: null },
  { id: 8, name: 'Yogurt con Granola', description: 'Yogurt natural, granola y fruta de temporada.', price: 4500, category: 'desayunos', isLunch: false, available: true, stock: 16, cafeteriaId: null, image: null },

  // --- Bebidas ---
  { id: 9, name: 'Café Latte', description: 'Café de origen colombiano con leche texturizada.', price: 4500, category: 'bebidas', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=70' },
  { id: 10, name: 'Jugo Natural', description: 'Mora, mango, lulo o maracuyá. En agua o leche.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 25, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=70' },
  { id: 11, name: 'Limonada de Coco', description: 'La clásica, cremosa y refrescante.', price: 5500, category: 'bebidas', isLunch: false, available: true, stock: 20, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=70' },
  { id: 12, name: 'Agua sin Gas 600 ml', description: 'Botella personal fría.', price: 3000, category: 'bebidas', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: null },
  { id: 13, name: 'Jugo Hit 500 ml', description: 'Caja personal, sabores surtidos.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 36, cafeteriaId: null, image: null },
  { id: 14, name: 'Gaseosa Personal 400 ml', description: 'Bien fría, sabores surtidos.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: null },
  { id: 15, name: 'Café Americano', description: 'Tinto de origen, tamaño mediano.', price: 3500, category: 'bebidas', isLunch: false, available: true, stock: 35, cafeteriaId: null, image: null },
  { id: 16, name: 'Bebida Energizante', description: 'Lata personal 250 ml.', price: 6500, category: 'bebidas', isLunch: false, available: true, stock: 18, cafeteriaId: null, image: null },

  // --- Snacks y tienda ---
  { id: 17, name: 'Empanada de Pollo', description: 'Masa crocante con ají de la casa.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=70' },
  { id: 18, name: 'Brownie con Helado', description: 'Brownie tibio con bola de vainilla.', price: 6000, category: 'snacks', isLunch: false, available: true, stock: 8, cafeteriaId: null, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=70' },
  { id: 19, name: 'Papas Margarita', description: 'Paquete personal, sabor natural.', price: 3500, category: 'snacks', isLunch: false, available: true, stock: 45, cafeteriaId: null, image: null },
  { id: 20, name: 'Chocorramo', description: 'Ponqué con cubierta de chocolate.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 30, cafeteriaId: null, image: null },
  { id: 21, name: 'Galletas Festival', description: 'Paquete de galletas surtidas.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 50, cafeteriaId: null, image: null },
  { id: 22, name: 'Chocolate Jet', description: 'Barra de chocolate con leche.', price: 2500, category: 'snacks', isLunch: false, available: true, stock: 40, cafeteriaId: null, image: null },
  { id: 23, name: 'Maní Tostado', description: 'Bolsa personal de maní salado.', price: 2000, category: 'snacks', isLunch: false, available: true, stock: 35, cafeteriaId: null, image: null },
  { id: 24, name: 'Obleas con Arequipe', description: 'Oblea artesanal con arequipe.', price: 2500, category: 'snacks', isLunch: false, available: true, stock: 25, cafeteriaId: null, image: null },
  { id: 25, name: 'Paquete Surtido', description: 'Selección de 3 snacks de tienda.', price: 7500, category: 'snacks', isLunch: false, available: true, stock: 12, cafeteriaId: null, image: null },
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
