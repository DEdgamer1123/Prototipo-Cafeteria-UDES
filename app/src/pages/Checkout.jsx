import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, CreditCard, QrCode, Upload, Store, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '../context/StoreContext';
import { formatCOP } from '../data/menu';

// Paso final del flujo: tarjeta (simulada) o transferencia con QR.
export default function Checkout({ user }) {
  const {
    cart,
    cartTotal,
    placeOrder,
    clearCart,
    cafeteriaActual,
    slotStatus,
    attachReceipt,
    showToast,
  } = useStore();
  const [method, setMethod] = useState('tarjeta');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(null);
  const [qr, setQr] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const pickupTime = state?.pickupTime ?? null;

  // Genera el QR de la transferencia cuando el pedido ya existe.
  // (Debe ir antes de cualquier return condicional: reglas de hooks.)
  useEffect(() => {
    if (!done || done.paymentMethod !== 'transferencia') return;
    const payload = [
      'UDES Food — pago por transferencia',
      `Pedido: ${done.id}`,
      `Cafetería: ${done.cafeteriaNombre}`,
      `Total: ${formatCOP(done.total)}`,
      'Beneficiario: Cafetería UDES (cuenta de ejemplo)',
      'Referencia: ' + done.id,
    ].join('\n');

    let activo = true;
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: { dark: '#004b9b', light: '#ffffff' },
    })
      .then((url) => {
        if (activo) setQr(url);
      })
      .catch(() => {
        if (activo) showToast('No se pudo generar el QR', 'warning');
      });

    return () => {
      activo = false;
    };
  }, [done, showToast]);

  // Redirect declarativo: evita navegar durante el render
  if (cart.length === 0 && !done) {
    return <Navigate to="/menu" replace />;
  }
  if (!cafeteriaActual && !done) {
    return <Navigate to="/cafeteria" replace />;
  }

  const slot = pickupTime
    ? slotStatus(cafeteriaActual).find((s) => s.hora === pickupTime)
    : null;

  const pay = async () => {
    setProcessing(true);

    if (method === 'transferencia') {
      const order = await placeOrder({
        pickupTime,
        customer: user?.name ?? 'estudiante',
        paymentMethod: 'transferencia',
      });
      setProcessing(false);
      if (order) {
        setDone(order);
        clearCart();
      }
      return;
    }

    const order = await placeOrder({
      pickupTime,
      customer: user?.name ?? 'estudiante',
      paymentMethod: 'tarjeta',
    });
    setProcessing(false);
    if (order) {
      setDone(order);
      clearCart();
    }
  };

  // Adjunta el comprobante (redimensionado) al pedido pendiente
  const adjuntarComprobante = (file) => {
    if (!file || !done) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setReceipt(dataUrl);
        attachReceipt(done.id, dataUrl);
        showToast('Comprobante adjuntado', 'success');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // ---------- Pantalla post-pago ----------
  if (done) {
    const esTransferencia = done.paymentMethod === 'transferencia';

    return (
      <main id="contenido" className="mx-auto max-w-md px-4 py-12">
        {!esTransferencia ? (
          <div className="text-center">
            <p className="text-success" aria-hidden="true">
              <CheckCircle2 size={64} className="mx-auto md:h-20 md:w-20" />
            </p>
            <h1 className="mt-4 text-2xl font-extrabold text-udes-blue">¡Pedido confirmado!</h1>
            <p className="mt-2 text-slate-600">Muestra este código en la cafetería:</p>
            <p className="mt-3 rounded-card bg-udes-blue-light py-4 text-3xl font-extrabold tracking-widest text-udes-blue">
              {done.id}
            </p>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-udes-blue">
              <Store size={16} aria-hidden="true" /> {done.cafeteriaNombre}
            </p>
            {done.pickupTime && (
              <p className="mt-1 flex items-center justify-center gap-2 font-semibold text-udes-gold-dark">
                <Clock size={18} aria-hidden="true" /> Recogida programada: {done.pickupTime}
              </p>
            )}
            <button
              onClick={() => navigate('/pedidos')}
              className="mt-6 w-full rounded-full bg-udes-blue py-3 font-bold text-white hover:bg-udes-blue-dark"
            >
              Ver mis pedidos
            </button>
          </div>
        ) : (
          <div>
            <h1 className="flex items-center gap-2 text-xl font-extrabold text-udes-blue">
              <QrCode size={22} aria-hidden="true" /> Paga tu pedido por transferencia
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pedido <strong>{done.id}</strong> reservado por 15 minutos en {done.cafeteriaNombre}.
            </p>

            <div className="mt-4 rounded-card bg-white p-5 text-center shadow-card">
              {qr ? (
                <img src={qr} alt={`Código QR para pagar el pedido ${done.id}`} className="mx-auto h-56 w-56" />
              ) : (
                <div className="mx-auto h-56 w-56 animate-pulse rounded-xl bg-slate-100" aria-label="Generando QR" />
              )}
              <p className="mt-3 text-2xl font-extrabold text-udes-blue">{formatCOP(done.total)}</p>
              <p className="text-xs font-semibold text-slate-500">Referencia: {done.id}</p>
              <p className="mt-2 text-xs text-slate-500">
                Escanea con tu app bancaria o transfiere a la cuenta de la cafetería indicando la
                referencia. El QR es informativo en este prototipo.
              </p>
            </div>

            <div className="mt-4 rounded-card border-2 border-udes-gold bg-udes-gold-light p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-udes-gold-dark">
                <ShieldCheck size={16} aria-hidden="true" /> Tu pago queda en verificación
              </p>
              <p className="mt-1 text-xs text-slate-700">
                El pedido no entra a la cola hasta que la cafetería confirme la transferencia. Si
                adjuntas el comprobante, la confirmación es más rápida.
              </p>

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-udes-blue hover:bg-udes-blue-light">
                <Upload size={16} aria-hidden="true" />
                {receipt ? 'Cambiar comprobante' : 'Adjuntar comprobante'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => adjuntarComprobante(e.target.files?.[0])}
                />
              </label>
              {receipt && (
                <img
                  src={receipt}
                  alt="Comprobante adjunto"
                  className="mt-3 h-24 w-24 rounded-xl object-cover"
                />
              )}
            </div>

            <button
              onClick={() => {
                setSent(true);
                showToast('Pedido enviado: la cafetería verificará tu transferencia', 'info');
                navigate('/pedidos');
              }}
              disabled={sent}
              className="mt-5 w-full rounded-full bg-udes-blue py-3.5 font-bold text-white hover:bg-udes-blue-dark disabled:opacity-60"
            >
              Ya transferí — enviar pedido
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="mt-2 w-full rounded-full border border-slate-300 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              Volver al menú
            </button>
          </div>
        )}
      </main>
    );
  }

  // ---------- Pantalla de pago ----------
  return (
    <main id="contenido" className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-udes-blue">Pago</h1>
      <p className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
        <Store size={16} aria-hidden="true" className="text-udes-blue" />
        {cafeteriaActual?.nombre}
      </p>

      <div className="rounded-card bg-white p-5 shadow-card">
        <h2 className="mb-3 font-bold">Resumen</h2>
        <ul className="space-y-1 p-0 text-sm text-slate-700">
          {cart.map((i) => (
            <li key={i.lineId ?? i.id} className="flex justify-between gap-2">
              <span>
                {i.qty} × {i.name}
                {i.optionsLabel && (
                  <span className="block text-xs text-slate-500">{i.optionsLabel}</span>
                )}
              </span>
              <span className="font-semibold">{formatCOP(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        {pickupTime && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-udes-gold-light px-3 py-2 text-sm font-bold text-udes-gold-dark">
            <Clock size={16} aria-hidden="true" /> Almuerzo programado: {pickupTime}
            {slot && <span className="font-semibold">· ≈ {slot.tiempoEstimado} min</span>}
          </p>
        )}
        <div className="mt-3 flex justify-between border-t pt-3 font-extrabold text-udes-blue">
          <span>Total</span>
          <span>{formatCOP(cartTotal)}</span>
        </div>
      </div>

      <fieldset className="mt-6 rounded-card bg-white p-5 shadow-card">
        <legend className="px-1 text-sm font-bold">Método de pago</legend>
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
          {[
            { id: 'tarjeta', label: 'Tarjeta (simulada)', Icon: CreditCard },
            { id: 'transferencia', label: 'Transferencia / QR', Icon: QrCode },
          ].map(({ id, label, Icon }) => (
            <label
              key={id}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold ${
                method === id
                  ? 'border-udes-blue bg-udes-blue-light text-udes-blue'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="metodo"
                value={id}
                checked={method === id}
                onChange={() => setMethod(id)}
                className="sr-only"
              />
              <Icon size={18} aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>

        {method === 'transferencia' && (
          <p className="mt-3 rounded-xl bg-udes-gold-light px-3 py-2 text-xs text-slate-700">
            Al continuar se genera un <strong>QR con la referencia de tu pedido</strong>. El pedido
            queda como <strong>pago pendiente</strong> hasta que la cafetería confirme la
            transferencia. No se cobra nada automáticamente.
          </p>
        )}
      </fieldset>

      <button
        onClick={pay}
        disabled={processing}
        className="mt-6 w-full rounded-full bg-udes-blue py-3.5 font-bold text-white hover:bg-udes-blue-dark disabled:opacity-60"
      >
        {processing
          ? 'Procesando…'
          : method === 'transferencia'
            ? 'Generar QR y reservar pedido'
            : `Pagar ${formatCOP(cartTotal)}`}
      </button>
    </main>
  );
}
