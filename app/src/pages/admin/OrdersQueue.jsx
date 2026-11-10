import { useState } from 'react';
import { Receipt, Banknote, Hourglass, Coffee, Clock, Flame, BellRing, QrCode, Check, X, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../data/menu';
import StatusBadge, { NEXT_STATE } from '../../components/StatusBadge';

// Cola de pedidos: el admin prepara, marca "listo" y confirma transferencias.
export default function OrdersQueue() {
  const { orders, setOrderStatus, confirmTransfer, rejectTransfer, showToast, cafeterias } = useStore();
  const [filtro, setFiltro] = useState('all');

  const visible = filtro === 'all' ? orders : orders.filter((o) => o.cafeteriaId === filtro);

  const advance = async (o) => {
    const next = NEXT_STATE[o.status];
    if (!next) return;
    const ok = await setOrderStatus(o.id, next);
    if (ok) {
      showToast(next === 'listo' ? `Pedido ${o.id} listo — usuario notificado` : `Pedido ${o.id} en preparación`, 'info');
    }
  };

  const confirmar = async (o) => {
    const ok = await confirmTransfer(o.id);
    if (ok) showToast(`Pago de ${o.id} confirmado — el pedido entra a la cola`, 'success');
  };

  const rechazar = async (o) => {
    const ok = await rejectTransfer(o.id);
    if (ok) showToast(`Transferencia de ${o.id} rechazada — stock devuelto`, 'warning');
  };

  const pendientesPago = visible.filter((o) => o.status === 'pendiente_pago');
  const pending = visible.filter((o) => ['recibido', 'preparando'].includes(o.status));
  const ready = visible.filter((o) => o.status === 'listo');
  const cancelados = visible.filter((o) => ['cancelado', 'expirado'].includes(o.status));
  const revenue = visible.filter((o) => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Pedidos', value: visible.length, Icon: Receipt },
    { label: 'Ingresos', value: formatCOP(revenue), Icon: Banknote },
    { label: 'Pendientes', value: pending.length, Icon: Hourglass },
    { label: 'Pagos por verificar', value: pendientesPago.length, Icon: QrCode },
  ];

  const OrderCard = ({ o }) => {
    const esTransferencia = o.paymentMethod === 'transferencia';
    return (
      <li className="rounded-card bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold text-udes-blue">{o.id} · {o.customer}</span>
          <StatusBadge status={o.status} />
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Store size={13} aria-hidden="true" /> {o.cafeteriaNombre ?? 'Cafetería'}
          </span>
          <span className="inline-flex items-center gap-1">
            {esTransferencia ? <><QrCode size={13} aria-hidden="true" /> Transferencia</> : <><Banknote size={13} aria-hidden="true" /> Tarjeta</>}
          </span>
          {o.status === 'pendiente_pago' && o.receipt && (
            <a href={o.receipt} target="_blank" rel="noreferrer" className="text-udes-blue underline">
              Ver comprobante
            </a>
          )}
        </p>

        <ul className="mt-2 list-none p-0 text-sm text-slate-700">
          {o.items.map((i) => (
            <li key={i.lineId ?? i.id}>
              {i.qty} × {i.name}
              {i.optionsLabel && <span className="text-slate-500"> · {i.optionsLabel}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between border-t pt-3 text-sm">
          <span className="font-extrabold">{formatCOP(o.total)}</span>
          {o.pickupTime && (
            <span className="flex items-center gap-1 rounded-full bg-udes-gold-light px-3 py-1 font-bold text-udes-gold-dark">
              <Clock size={14} aria-hidden="true" /> Para las {o.pickupTime}
            </span>
          )}
        </div>

        {/* Transferencia pendiente: confirmar o rechazar */}
        {o.status === 'pendiente_pago' && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => confirmar(o)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-success py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              <Check size={16} aria-hidden="true" /> Confirmar pago
            </button>
            <button
              onClick={() => rechazar(o)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-danger-light py-2.5 text-sm font-bold text-danger hover:bg-danger hover:text-white"
            >
              <X size={16} aria-hidden="true" /> Rechazar
            </button>
          </div>
        )}

        {/* Flujo normal de preparación */}
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
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-udes-blue">Cola de pedidos</h1>
          <p className="text-sm text-slate-600">
            {pending.length} pendientes · {ready.length} listos · {pendientesPago.length} pagos por verificar
            {cancelados.length > 0 && ` · ${cancelados.length} cancelados`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Cafetería
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            <option value="all">Todas</option>
            {cafeterias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-card bg-white p-5 shadow-card">
            <dt className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Icon size={16} aria-hidden="true" className="text-udes-blue" /> {label}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-udes-blue lg:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      {visible.length === 0 ? (
        <div className="rounded-card bg-white py-16 text-center text-slate-500 shadow-card">
          <p className="text-slate-400" aria-hidden="true"><Coffee size={40} className="mx-auto md:h-14 md:w-14" /></p>
          <p className="mt-3">Sin pedidos por ahora.</p>
        </div>
      ) : (
        <>
          {pendientesPago.length > 0 && (
            <>
              <h2 className="mb-3 font-bold text-warning">Pagos por verificar</h2>
              <ul className="mb-8 space-y-4 p-0">{pendientesPago.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
            </>
          )}

          {pending.length > 0 && (
            <>
              <h2 className="mb-3 font-bold text-slate-700">Pendientes</h2>
              <ul className="mb-8 space-y-4 p-0">{pending.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
            </>
          )}

          {ready.length > 0 && (
            <>
              <h2 className="mb-3 font-bold text-slate-700">Listos para entrega</h2>
              <ul className="space-y-4 p-0">{ready.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
            </>
          )}

          {cancelados.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 font-bold text-slate-500">Cancelados</h2>
              <ul className="space-y-4 p-0 opacity-70">{cancelados.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
