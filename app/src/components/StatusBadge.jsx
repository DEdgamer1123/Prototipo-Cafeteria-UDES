import { Receipt, Flame, BellRing, QrCode, XCircle, Clock } from 'lucide-react';

const STATES = {
  pendiente_pago: { label: 'Pago pendiente', Icon: QrCode, cls: 'bg-warning-light text-warning' },
  recibido: { label: 'Recibido', Icon: Receipt, cls: 'bg-warning-light text-warning' },
  preparando: { label: 'Preparando', Icon: Flame, cls: 'bg-udes-blue-light text-udes-blue' },
  listo: { label: '¡Listo para recoger!', Icon: BellRing, cls: 'bg-success-light text-success' },
  cancelado: { label: 'Cancelado', Icon: XCircle, cls: 'bg-danger-light text-danger' },
  expirado: { label: 'Expirado', Icon: Clock, cls: 'bg-slate-100 text-slate-600' },
};

export const NEXT_STATE = { recibido: 'preparando', preparando: 'listo' };

export default function StatusBadge({ status }) {
  const s = STATES[status] ?? STATES.recibido;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
      <s.Icon size={14} aria-hidden="true" />
      {s.label}
    </span>
  );
}
