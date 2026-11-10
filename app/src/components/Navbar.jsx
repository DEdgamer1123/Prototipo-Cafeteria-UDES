import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bell, ReceiptText, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logoAlt from '../assets/logo-alt.png';

export default function Navbar({ user, onLogout }) {
  const { cartCount, showToast } = useStore();
  const navigate = useNavigate();
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const askPermission = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
    showToast(
      p === 'granted'
        ? 'Avisos activados: te avisaremos cuando tu pedido esté listo'
        : 'Sin avisos del navegador; igual los verás dentro de la app',
      p === 'granted' ? 'success' : 'warning'
    );
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-full px-2.5 py-2.5 text-sm font-semibold transition-colors duration-fast sm:px-4 ${
      isActive ? 'bg-white text-udes-blue' : 'text-white/85 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-udes-blue shadow-card">
      {/* Skip link para accesibilidad */}
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:text-udes-blue focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Navegación principal">
        <Link to="/menu" className="flex items-center gap-3">
          <span className="flex h-10 w-20 shrink-0 items-center rounded-lg bg-white px-2 py-1 min-[400px]:w-24 sm:w-32">
            <img src={logoAlt} alt="Universidad de Santander UDES" className="h-full w-auto object-contain" />
          </span>
          <span className="hidden font-bold tracking-wide text-white sm:block">
            UDES <span className="text-udes-gold">Food</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/menu" className={linkClass} aria-label="Menú">
            <UtensilsCrossed size={18} aria-hidden="true" className="sm:hidden" />
            <span className="hidden sm:inline">Menú</span>
          </NavLink>
          <NavLink to="/pedidos" className={linkClass} aria-label="Mis pedidos">
            <ReceiptText size={18} aria-hidden="true" className="sm:hidden" />
            <span className="hidden sm:inline">Mis pedidos</span>
          </NavLink>
          <NavLink to="/carrito" className={linkClass} aria-label={`Carrito, ${cartCount} artículos`}>
            <ShoppingCart size={18} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="rounded-full bg-udes-gold px-2 py-0.5 text-xs font-bold text-udes-blue-dark">
                {cartCount}
              </span>
            )}
          </NavLink>
          {notifPerm === 'default' && (
            <button
              onClick={askPermission}
              aria-label="Activar avisos de pedidos listos"
              title="Activar avisos cuando tu pedido esté listo"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/10"
            >
              <Bell size={16} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={() => { onLogout(); navigate('/'); }}
            className="ml-1 rounded-full border border-white/40 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </nav>
    </header>
  );
}
