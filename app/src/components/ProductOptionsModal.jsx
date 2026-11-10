import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from './Modal';
import { formatCOP, opcionesCompletas, precioConOpciones } from '../data/menu';

/** Modal para elegir las opciones de un producto (agua, café, proteína, paquetes…). */
export default function ProductOptionsModal({ product, onClose, onConfirm }) {
  const [seleccion, setSeleccion] = useState({});
  const precio = precioConOpciones(product, seleccion);
  const listo = opcionesCompletas(product, seleccion);

  return (
    <Modal title={`${product.name} · opciones`} onClose={onClose}>
      <div className="space-y-4">
        {product.options.map((group) => (
          <fieldset key={group.id}>
            <legend className="mb-2 text-sm font-bold text-slate-700">
              {group.label}
              {group.required && <span className="text-danger"> *</span>}
            </legend>
            <div className="grid gap-2">
              {group.choices.map((choice) => {
                const activa = seleccion[group.id] === choice.id;
                return (
                  <label
                    key={choice.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-fast ${
                      activa
                        ? 'border-udes-blue bg-udes-blue-light text-udes-blue'
                        : 'border-slate-200 text-slate-600 hover:border-udes-blue/40'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`${product.id}-${group.id}`}
                        checked={activa}
                        onChange={() =>
                          setSeleccion((s) => ({ ...s, [group.id]: choice.id }))
                        }
                        className="sr-only"
                      />
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          activa ? 'border-udes-blue bg-udes-blue text-white' : 'border-slate-300'
                        }`}
                        aria-hidden="true"
                      >
                        {activa && <Check size={10} />}
                      </span>
                      {choice.label}
                    </span>
                    {typeof choice.price === 'number' && (
                      <span className="shrink-0 text-xs font-bold">{formatCOP(choice.price)}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-bold text-slate-600">Precio</span>
          <span className="text-xl font-extrabold text-udes-blue">{formatCOP(precio)}</span>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(seleccion)}
          disabled={!listo}
          className="w-full rounded-full bg-udes-blue py-3 font-bold text-white transition-colors duration-fast hover:bg-udes-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {listo ? 'Agregar al carrito' : 'Elige las opciones'}
        </button>
      </div>
    </Modal>
  );
}
