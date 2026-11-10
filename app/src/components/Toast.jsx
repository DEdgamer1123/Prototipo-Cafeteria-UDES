import { useStore } from '../context/StoreContext';

// Feedback inmediato (heuristica de Nielsen) + role="alert" accesible
export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const colors = {
    success: 'bg-success text-white',
    info: 'bg-udes-blue text-white',
    warning: 'bg-warning text-white',
  };
  return (
    <div
      role="alert"
      className={`fixed left-1/2 top-20 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-5 py-3 text-center text-sm font-semibold shadow-pop ${colors[toast.type] ?? colors.success}`}
    >
      {toast.message}
    </div>
  );
}
