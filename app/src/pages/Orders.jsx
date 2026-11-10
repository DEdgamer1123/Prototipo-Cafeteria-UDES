import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, BellRing, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCOP } from '../data/menu';
import StatusBadge from '../components/StatusBadge';
import { SkeletonRow } from '../components/Skeletons';

export default function Orders({ user }) {
  const { orders } = useStore();
  const [loading, setLoading] = useState(true);
  const mine = orders.filter((o) => o.customer === user?.name);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const anyReady = mine.some((o) => o.status === 'listo');

  if (loading) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl space-y-3 px-4 py-8">
        <SkeletonRow /><SkeletonRow /><SkeletonRow />
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-udes-blue">Mis pedidos</h1>

      {anyReady && (
        <div role="alert" className="mb-6 flex items-center gap-2 rounded-card border-2 border-success bg-success-light p-4 font-bold text-success">
          <BellRing size={20} aria-hidden="true" />
          ¡Tienes un pedido listo! Pasa por la cafetería y muestra tu código.
        </div>
      )}

      {mine.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400" aria-hidden="true"><Receipt size={48} className="mx-auto md:h-16 md:w-16" /></p>
          <p className="mt-4 text-slate-600 md:text-lg">Aún no has hecho pedidos.</p>
          <Link to="/menu" className="mt-4 inline-block rounded-full bg-udes-blue px-6 py-3 font-bold text-white hover:bg-udes-blue-dark">
            Ordenar algo rico
          </Link>
        </div>
      ) : (
        <ul className="space-y-4 p-0">
          {mine.map((o) => (
            <li key={o.id} className="rounded-card bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-lg font-extrabold text-udes-blue">{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <ul className="mt-2 list-none p-0 text-sm text-slate-700">
                {o.items.map((i) => (
                  <li key={i.id}>{i.qty} × {i.name}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between border-t pt-3 text-sm">
                <span className="font-extrabold text-udes-blue">{formatCOP(o.total)}</span>
                {o.pickupTime && (
                  <span className="flex items-center gap-1 font-semibold text-udes-gold-dark">
                    <Clock size={14} aria-hidden="true" /> Recoger a las {o.pickupTime}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
