import { useEffect, useState } from 'react';
import { UtensilsCrossed, Egg, CupSoda, Cookie } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/menu';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeletons';

// Iconos de categoria (Lucide en vez de emojis: estilo consistente)
const CATEGORY_ICON = {
  almuerzos: UtensilsCrossed,
  desayunos: Egg,
  bebidas: CupSoda,
  snacks: Cookie,
};

export default function Menu() {
  const { products } = useStore();
  const [category, setCategory] = useState('almuerzos');
  const [loading, setLoading] = useState(true);

  // Delay simulado para mostrar skeletons
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [category]);

  const filtered = products.filter((p) => p.category === category);

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-udes-blue">Menú de hoy</h1>
      <p className="mb-6 text-sm text-slate-600">
        Solo los <strong>almuerzos</strong> se pueden programar con hora de recogida
      </p>

      {/* Ley de Hick: 4 categorias, una sola decision */}
      <div role="tablist" aria-label="Categorías del menú" className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c.id];
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-fast ${
                category === c.id
                  ? 'bg-udes-blue text-white shadow-card'
                  : 'bg-white text-udes-blue hover:bg-udes-blue-light'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {c.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando menú">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}><ProductCard product={p} /></li>
          ))}
        </ul>
      )}
    </main>
  );
}
