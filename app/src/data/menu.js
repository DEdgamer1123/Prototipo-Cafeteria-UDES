// Datos mock del menu (fase prototipo — sin backend)
// isLunch: solo almuerzos permiten escoger hora de recogida

export const CATEGORIES = [
  { id: 'almuerzos', label: 'Almuerzos' },
  { id: 'desayunos', label: 'Desayunos' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'snacks', label: 'Snacks' },
];

export const MENU = [
  { id: 1, name: 'Almuerzo Ejecutivo', description: 'Proteina del dia, arroz, ensalada, sopa y jugo natural.', price: 12000, category: 'almuerzos', isLunch: true, available: true, stock: 15, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70' },
  { id: 2, name: 'Almuerzo Vegetariano', description: 'Bowl de lentejas, quinoa, vegetales asados y jugo.', price: 11000, category: 'almuerzos', isLunch: true, available: true, stock: 12, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=70' },
  { id: 3, name: 'Pechuga a la Plancha', description: 'Con pure de papa, ensalada fresca y limonada.', price: 14000, category: 'almuerzos', isLunch: true, available: true, stock: 10, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=70' },
  { id: 4, name: 'Calentado Paisa', description: 'Frijoles, arroz, huevo, arepa y chocolate.', price: 8000, category: 'desayunos', isLunch: false, available: true, stock: 20, image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=70' },
  { id: 5, name: 'Huevos Rancheros', description: 'Con arepa, queso y cafe americano.', price: 7500, category: 'desayunos', isLunch: false, available: true, stock: 18, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=70' },
  { id: 6, name: 'Cafe Latte', description: 'Cafe de origen colombiano con leche texturizada.', price: 4500, category: 'bebidas', isLunch: false, available: true, stock: 30, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=70' },
  { id: 7, name: 'Jugo Natural', description: 'Mora, mango, lulo o maracuya. En agua o leche.', price: 4000, category: 'bebidas', isLunch: false, available: true, stock: 25, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=70' },
  { id: 8, name: 'Limonada de Coco', description: 'La clasica, cremosa y refrescante.', price: 5500, category: 'bebidas', isLunch: false, available: true, stock: 20, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=70' },
  { id: 9, name: 'Empanada de Pollo', description: 'Masa crocante con ají de la casa.', price: 3000, category: 'snacks', isLunch: false, available: true, stock: 40, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=70' },
  { id: 10, name: 'Brownie con Helado', description: 'Brownie tibio con bola de vainilla.', price: 6000, category: 'snacks', isLunch: false, available: true, stock: 8, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=70' },
];

// Franjas de recogida para almuerzos (Ley de Hick: opciones limitadas y claras)
export const PICKUP_SLOTS = ['11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'];

// Re-export desde el módulo único de dinero (fuente de verdad).
export { formatCOP } from '../lib/money';
