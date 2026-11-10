import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Package, UtensilsCrossed } from 'lucide-react';
import logoAlt from '../../assets/logo-alt.png';

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-fast ${
      isActive ? 'bg-udes-blue text-white' : 'text-udes-blue hover:bg-udes-blue-light'
    }`;

  return (
    <div className="min-h-screen">
      <header className="bg-udes-blue shadow-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-24 shrink-0 items-center rounded-lg bg-white px-2 py-1 sm:w-32">
              <img src={logoAlt} alt="Universidad de Santander UDES" className="h-full w-auto object-contain" />
            </span>
            <span className="truncate text-sm font-bold text-white sm:text-base">
              UDES Food · <span className="text-udes-gold">Administración</span>
            </span>
          </div>
          <button
            onClick={() => { onLogout(); navigate('/'); }}
            className="rounded-full border border-white/40 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:gap-6 md:py-8">
        <nav className="flex w-full flex-row items-center gap-2 overflow-x-auto rounded-card bg-white p-3 shadow-card md:h-fit md:w-52 md:flex-col md:items-stretch md:overflow-visible" aria-label="Menú de administración">
          <NavLink to="/admin/pedidos" className={linkClass}><Package size={16} aria-hidden="true" /> Pedidos</NavLink>
          <NavLink to="/admin/menu" className={linkClass}><UtensilsCrossed size={16} aria-hidden="true" /> Menú</NavLink>
          <Link to="/menu" className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-udes-blue md:mt-2 md:border-t md:pt-3">
            Ver como usuario →
          </Link>
        </nav>
        <main id="contenido" className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
