import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, X, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCOP } from '../data/menu';

export default function Cart() {
  const {
    cart,
    setQty,
    removeFromCart,
    cartTotal,
    cartHasLunch,
    cafeteriaActual,
    slotStatus,
    showToast,
  } = useStore();
  const [pickupTime, setPickupTime] = useState(null);
  const navigate = useNavigate();

  if (!cafeteriaActual) {
    return <Navigate to="/cafeteria" replace />;
  }

  if (cart.length === 0) {
    return (
      <main id="contenido" className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-udes-blue" aria-hidden="true"><ShoppingCart size={48} className="mx-auto md:h-16 md:w-16" /></p>
        <h1 className="mt-4 text-2xl font-extrabold text-udes-blue md:text-3xl">Tu carrito está vacío</h1>
        <Link to="/menu" className="mt-6 inline-block rounded-full bg-udes-blue px-6 py-3 font-bold text-white hover:bg-udes-blue-dark">
          Ver el menú
        </Link>
      </main>
    );
  }

  const slots = slotStatus(cafeteriaActual);
  const slotElegido = slots.find((s) => s.hora === pickupTime) ?? null;

  const continuar = () => {
    if (cartHasLunch && !pickupTime) {
      showToast('Selecciona una hora de recogida', 'warning');
      return;
    }
    if (slotElegido?.bloqueada) {
      showToast(`Esa franja no está disponible: ${slotElegido.motivo}`, 'warning');
      return;
    }
    navigate('/checkout', { state: { pickupTime } });
  };

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-udes-blue">Tu pedido</h1>
      <p className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
        <Store size={16} aria-hidden="true" className="text-udes-blue" />
        {cafeteriaActual.nombre}
        {cafeteriaActual.sede ? ` · ${cafeteriaActual.sede}` : ''}
      </p>

      <ul className="space-y-3 p-0">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-card bg-white p-4 shadow-card sm:gap-4">
            {item.image ? (
              <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-udes-blue-light text-udes-blue" aria-hidden="true">
                <ShoppingCart size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.name}</p>
              <p className="text-sm font-semibold text-udes-blue">{formatCOP(item.price)}</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2" aria-label={`Cantidad de ${item.name}`}>
              <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="Disminuir cantidad" className="flex h-10 w-10 items-center justify-center rounded-full bg-udes-blue-light text-lg font-bold text-udes-blue">−</button>
              <span className="w-6 text-center font-bold" aria-live="polite">{item.qty}</span>
              <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Aumentar cantidad" className="flex h-10 w-10 items-center justify-center rounded-full bg-udes-blue-light text-lg font-bold text-udes-blue">+</button>
            </div>
            <button onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.name}`} className="flex shrink-0 items-center justify-center rounded-full p-3 text-danger hover:bg-danger-light">
              <X size={18} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {/* Progressive disclosure: solo aparece si hay almuerzo */}
      {cartHasLunch && (
        <section aria-labelledby="hora-title" className="mt-6 rounded-card border-2 border-udes-gold bg-udes-gold-light p-5">
          <h2 id="hora-title" className="flex items-center gap-2 font-extrabold text-udes-gold-dark">
            <Clock size={18} aria-hidden="true" />
            ¿A qué hora recoges tu almuerzo?
          </h2>
          <p className="mb-4 text-sm text-slate-700">
            Lo prepararemos para que esté listo a esa hora. Las franjas sin cupo o que no alcanzan a
            prepararse antes del cierre aparecen bloqueadas.
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Hora de recogida">
            {slots.map((slot) => {
              const seleccionada = pickupTime === slot.hora;
              return (
                <button
                  key={slot.hora}
                  role="radio"
                  aria-checked={seleccionada}
                  aria-disabled={slot.bloqueada}
                  disabled={slot.bloqueada}
                  onClick={() => setPickupTime(slot.hora)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors duration-fast ${
                    slot.bloqueada
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                      : seleccionada
                        ? 'bg-udes-gold-dark text-white'
                        : 'bg-white text-udes-gold-dark hover:bg-udes-gold/20'
                  }`}
                >
                  <span className="block">{slot.hora}</span>
                  <span className={`block text-[10px] font-semibold ${slot.bloqueada ? 'text-slate-500' : seleccionada ? 'text-white/90' : 'text-slate-500'}`}>
                    {slot.bloqueada ? slot.motivo : `${slot.restante} cupos`}
                  </span>
                </button>
              );
            })}
          </div>

          {slotElegido && !slotElegido.bloqueada && (
            <p className="mt-3 text-sm font-semibold text-udes-gold-dark" role="status">
              Tiempo estimado de preparación: ≈ {slotElegido.tiempoEstimado} min
            </p>
          )}
        </section>
      )}

      <div className="mt-6 flex items-center justify-between rounded-card bg-white p-5 shadow-card">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-extrabold text-udes-blue">{formatCOP(cartTotal)}</span>
      </div>

      <button
        onClick={continuar}
        disabled={cartHasLunch && !pickupTime}
        className="mt-4 w-full rounded-full bg-udes-blue py-3.5 font-bold text-white transition-colors duration-fast hover:bg-udes-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {cartHasLunch && !pickupTime ? 'Selecciona la hora de recogida' : 'Continuar al pago →'}
      </button>
    </main>
  );
}
