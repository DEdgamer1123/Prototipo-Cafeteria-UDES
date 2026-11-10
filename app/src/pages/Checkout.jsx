import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, CreditCard, Banknote } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCOP } from '../data/menu';

// Paso final del flujo (Hick: solo pago simulado aqui, una accion clara)
export default function Checkout({ user }) {
  const { cart, cartTotal, placeOrder } = useStore();
  const [method, setMethod] = useState('tarjeta');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const pickupTime = state?.pickupTime ?? null;

  // Redirect declarativo: evita navegar durante el render (anti-patron de React)
  if (cart.length === 0 && !done) {
    return <Navigate to="/menu" replace />;
  }

  const pay = () => {
    setProcessing(true); // estado de carga en el boton (feedback inmediato)
    setTimeout(() => {
      const order = placeOrder({ pickupTime, customer: user?.name ?? 'estudiante' });
      setProcessing(false);
      setDone(order);
    }, 1500);
  };

  if (done) {
    return (
      <main id="contenido" className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-success" aria-hidden="true"><CheckCircle2 size={64} className="mx-auto md:h-20 md:w-20" /></p>
        <h1 className="mt-4 text-2xl font-extrabold text-udes-blue">¡Pago exitoso!</h1>
        <p className="mt-2 text-slate-600">Muestra este código en la cafetería:</p>
        <p className="mt-3 rounded-card bg-udes-blue-light py-4 text-3xl font-extrabold tracking-widest text-udes-blue">
          {done.id}
        </p>
        {done.pickupTime && (
          <p className="mt-3 flex items-center justify-center gap-2 font-semibold text-udes-gold-dark">
            <Clock size={18} aria-hidden="true" /> Recogida programada: {done.pickupTime}
          </p>
        )}
        <button onClick={() => navigate('/pedidos')} className="mt-6 w-full rounded-full bg-udes-blue py-3 font-bold text-white hover:bg-udes-blue-dark">
          Ver mis pedidos
        </button>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-udes-blue">Pago</h1>

      <div className="rounded-card bg-white p-5 shadow-card">
        <h2 className="mb-3 font-bold">Resumen</h2>
        <ul className="space-y-1 p-0 text-sm text-slate-700">
          {cart.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span>{i.qty} × {i.name}</span>
              <span className="font-semibold">{formatCOP(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        {pickupTime && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-udes-gold-light px-3 py-2 text-sm font-bold text-udes-gold-dark">
            <Clock size={16} aria-hidden="true" /> Almuerzo programado: {pickupTime}
          </p>
        )}
        <div className="mt-3 flex justify-between border-t pt-3 font-extrabold text-udes-blue">
          <span>Total</span><span>{formatCOP(cartTotal)}</span>
        </div>
      </div>

      <fieldset className="mt-6 rounded-card bg-white p-5 shadow-card">
        <legend className="px-1 text-sm font-bold">Método de pago (simulado)</legend>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {['tarjeta', 'efectivo'].map((m) => {
            const Icon = m === 'tarjeta' ? CreditCard : Banknote;
            return (
              <label key={m} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold capitalize ${
                method === m ? 'border-udes-blue bg-udes-blue-light text-udes-blue' : 'border-slate-200 text-slate-600'
              }`}>
                <input type="radio" name="metodo" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                <Icon size={18} aria-hidden="true" />
                {m}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        onClick={pay}
        disabled={processing}
        className="mt-6 w-full rounded-full bg-udes-blue py-3.5 font-bold text-white hover:bg-udes-blue-dark disabled:opacity-60"
      >
        {processing ? 'Procesando pago…' : `Pagar ${formatCOP(cartTotal)}`}
      </button>
    </main>
  );
}
