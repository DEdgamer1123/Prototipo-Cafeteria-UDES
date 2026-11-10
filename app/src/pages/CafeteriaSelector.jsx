import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, UtensilsCrossed, Coffee, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CafeteriaSelector() {
  const { cafeterias, cafeteriaId, setCafeteria, showToast } = useStore();
  const navigate = useNavigate();

  const choose = (caf) => {
    setCafeteria(caf.id);
    showToast(`Recogerás en ${caf.nombre}`, 'success');
    navigate('/menu');
  };

  return (
    <main id="contenido" className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-udes-blue">
          <Store size={24} aria-hidden="true" /> ¿Dónde recoges tu pedido?
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Elige una cafetería. El menú y las horas disponibles se ajustan a lo que ofrece cada una.
        </p>
      </header>

      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {cafeterias.map((caf) => {
          const activa = caf.id === cafeteriaId;
          const Icono = caf.vendeAlmuerzos ? UtensilsCrossed : Coffee;
          return (
            <li key={caf.id}>
              <article
                className={`flex h-full flex-col rounded-card bg-white p-5 shadow-card transition-shadow duration-med hover:shadow-pop ${
                  activa ? 'ring-2 ring-udes-blue' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-udes-blue-light text-udes-blue">
                    <Icono size={20} aria-hidden="true" />
                  </span>
                  {activa && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-1 text-xs font-bold text-success">
                      <Check size={12} aria-hidden="true" /> Seleccionada
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-extrabold text-udes-blue">{caf.nombre}</h2>
                <p className="flex items-center gap-1 text-sm text-slate-600">
                  <MapPin size={14} aria-hidden="true" /> {caf.sede}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                  <Clock size={14} aria-hidden="true" /> {caf.horarioApertura} – {caf.horarioCierre}
                </p>

                <p
                  className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                    caf.vendeAlmuerzos
                      ? 'bg-success-light text-success'
                      : 'bg-warning-light text-warning'
                  }`}
                >
                  {caf.vendeAlmuerzos ? 'Vende almuerzos' : 'Solo bebidas y snacks'}
                </p>

                <button
                  onClick={() => choose(caf)}
                  className="mt-4 w-full rounded-full bg-udes-blue py-2.5 text-sm font-bold text-white transition-colors duration-fast hover:bg-udes-blue-dark"
                >
                  {activa ? 'Continuar aquí' : 'Elegir esta cafetería'}
                </button>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-xs text-slate-500">
        Puedes cambiar de cafetería cuando quieras desde la barra superior.
      </p>
    </main>
  );
}
