import { Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCOP } from '../data/menu';

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  const soldOut = !product.available || (product.stock ?? 0) <= 0;
  const lowStock = !soldOut && product.stock <= 3;

  return (
    <article className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-med hover:shadow-pop">
      <div className="relative h-40 overflow-hidden sm:h-48">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {product.isLunch && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-udes-blue px-3 py-1 text-xs font-bold text-white">
            <Clock size={12} aria-hidden="true" />
            Programa tu hora
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-sm text-slate-600">{product.description}</p>
        {lowStock && (
          <p className="text-xs font-bold text-warning">Solo quedan {product.stock} unidades</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-extrabold text-udes-blue">{formatCOP(product.price)}</span>
          <button
            onClick={() => addToCart(product)}
            disabled={soldOut}
            className="rounded-full bg-udes-blue px-4 py-2 text-sm font-bold text-white transition-colors duration-fast hover:bg-udes-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
