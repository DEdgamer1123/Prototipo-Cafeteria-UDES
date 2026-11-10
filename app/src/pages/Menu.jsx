import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UtensilsCrossed, Egg, CupSoda, Cookie, Store } from 'lucide-react';
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
  const { productosVisibles, cafeteriaActual } = useStore();
  const [category, setCategory] = useState('almuerzos');
  const [loading, setLoading] = useState(true);

  // Sin cafetería elegida no se puede ver el menú
  if (!cafeteriaActual) {
    return <Navigate to="/cafeteria" replace />;
  }

  // Categorías que esta cafetería sí vende
  const categoriasVisibles = CATEGORIES.filter(
    (c) =>
      (c.id !== 'almuerzos' || cafeteriaActual.vendeAlmuerzos) &&
      (c.id !== 'desayunos' || cafeteriaActual.vendeDesayunos)
  );
  const categoriaActiva = categoriasVisibles.some((c) => c.id === category)
    ? category
    : categoriasVisibles[0].id;

  return (
    <MenuContent
      categoriaActiva={categoriaActiva}
      setCategory={setCategory}
      categoriasVisibles={categoriasVisibles}
      productosVisibles={productosVisibles}
      cafeteriaActual={cafeteriaActual}
      loading={loading}
      setLoading={setLoading}
    />
  );
}

function MenuContent({
  categoriaActiva,
  setCategory,
  categoriasVisibles,
  productosVisibles,
  cafeteriaActual,
  loading,
  setLoading,
}) {
  // Delay simulado para mostrar skeletons
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [categoriaActiva, setLoading]);

  const filtered = productosVisibles.filter((p) => p.category === categoriaActiva);
  const sinAlmuerzos = !cafeteriaActual.vendeAlmuerzos;
  const sinDesayunos = !cafeteriaActual.vendeDesayunos;

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-udes-blue">Menú de hoy</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Store size={16} aria-hidden="true" className="text-udes-blue" />
            {cafeteriaActual.nombre} · {cafeteriaActual.sede}
            <Link to="/cafeteria" className="ml-2 text-xs font-bold text-udes-blue underline">
              Cambiar
            </Link>
          </p>
          {(sinAlmuerzos || sinDesayunos) && (
            <p className="mt-1 text-xs font-bold text-warning">
              {sinAlmuerzos && sinDesayunos
                ? 'Esta cafetería no vende almuerzos ni desayunos: solo bebidas y snacks.'
                : sinAlmuerzos
                  ? 'Esta cafetería no vende almuerzos.'
                  : 'Esta cafetería no vende desayunos.'}
            </p>
          )}
        </div>
      </div>
      <p className="mb-6 mt-2 text-sm text-slate-600">
        Solo los <strong>almuerzos</strong> se pueden programar con hora de recogida
      </p>

      {/* Ley de Hick: pocas categorías, una sola decisión */}
      <div role="tablist" aria-label="Categorías del menú" className="mb-8 flex flex-wrap gap-2">
        {categoriasVisibles.map((c) => {
          const Icon = CATEGORY_ICON[c.id];
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={categoriaActiva === c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-fast ${
                categoriaActiva === c.id
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
