import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Ventana modal accesible: role="dialog", focus trap, cierra con Esc
// y devuelve el foco al elemento que la abrio.
export default function Modal({ title, onClose, children }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const previousFocus = document.activeElement;
    box?.querySelector('input, select, textarea, button:not([aria-label])')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !box) return;
      const items = [...box.querySelectorAll('button, input, select, textarea, [href]')]
        .filter((el) => !el.disabled);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // bloquea scroll del fondo
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-5 shadow-pop sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-extrabold text-udes-blue">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
