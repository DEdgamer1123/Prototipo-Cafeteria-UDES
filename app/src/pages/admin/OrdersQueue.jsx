import { Receipt, Banknote, Hourglass, Coffee, Clock, Flame, BellRing } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../data/menu';
import StatusBadge, { NEXT_STATE } from '../../components/StatusBadge';

// Cola de pedidos: el admin prepara y marca "listo" (notifica al usuario)
export default function OrdersQueue() {
  const { orders, setOrderStatus, showToast } = useStore();

  const advance = (o) => {
    const next = NEXT_STATE[o.status];
    if (!next) return;
    setOrderStatus(o.id, next);
    showToast(next === 'listo' ? `Pedido ${o.id} listo — usuario notificado` : `Pedido ${o.id} en preparación`, 'info');
  };

  const pending = orders.filter((o) => o.status !== 'listo');
  const ready = orders.filter((o) => o.status === 'listo');
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  // Ley de Hick: solo 3 metricas esenciales para el admin
  const stats = [
    { label: 'Pedidos hoy', value: orders.length, Icon: Receipt },
    { label: 'Ingresos hoy', value: formatCOP(revenue), Icon: Banknote },
    { label: 'Pendientes', value: pending.length, Icon: Hourglass },
  ];

  const OrderCard = ({ o }) => (
    <li className="rounded-card bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-extrabold text-udes-blue">{o.id} · {o.customer}</span>
        <StatusBadge status={o.status} />
      </div>
      <ul className="mt-2 list-none p-0 text-sm text-slate-700">
        {o.items.map((i) => <li key={i.id}>{i.qty} × {i.name}</li>)}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between border-t pt-3 text-sm">
        <span className="font-extrabold">{formatCOP(o.total)}</span>
        {o.pickupTime && (
          <span className="flex items-center gap-1 rounded-full bg-udes-gold-light px-3 py-1 font-bold text-udes-gold-dark">
            <Clock size={14} aria-hidden="true" /> Para las {o.pickupTime}
          </span>
        )}
      </div>
      {NEXT_STATE[o.status] && (
        <button
          onClick={() => advance(o)}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white transition-colors duration-fast ${
            o.status === 'preparando' ? 'bg-success hover:opacity-90' : 'bg-udes-blue hover:bg-udes-blue-dark'
          }`}
        >
          {o.status === 'recibido'
            ? (<><Flame size={16} aria-hidden="true" /> Iniciar preparación</>)
            : (<><BellRing size={16} aria-hidden="true" /> Marcar como listo y notificar</>)}
        </button>
      )}
    </li>
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-udes-blue">Cola de pedidos</h1>
      <p className="mb-6 text-sm text-slate-600">{pending.length} pendientes · {ready.length} listos hoy</p>

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-card bg-white p-5 shadow-card">
            <dt className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Icon size={16} aria-hidden="true" className="text-udes-blue" /> {label}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-udes-blue lg:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      {orders.length === 0 ? (
        <div className="rounded-card bg-white py-16 text-center text-slate-500 shadow-card">
          <p className="text-slate-400" aria-hidden="true"><Coffee size={40} className="mx-auto md:h-14 md:w-14" /></p>
          <p className="mt-3">Sin pedidos por ahora.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-3 font-bold text-slate-700">Pendientes</h2>
          <ul className="mb-8 space-y-4 p-0">{pending.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
          {ready.length > 0 && (
            <>
              <h2 className="mb-3 font-bold text-slate-700">Listos para entrega</h2>
              <ul className="space-y-4 p-0">{ready.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
