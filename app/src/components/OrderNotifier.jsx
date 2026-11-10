import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

// Vigila los pedidos del usuario actual y avisa cuando pasan a "listo".
// Esta montado en el shell del usuario, asi que funciona en cualquier
// pagina de la app y (via evento storage) aunque este en otra pestana.
// Si la pagina no esta visible y hay permiso, usa una notificacion
// nativa del navegador para avisar aun con otra app al frente.
export default function OrderNotifier({ userName }) {
  const { orders, showToast } = useStore();
  const prev = useRef(null);

  useEffect(() => {
    if (!userName) return;
    const mine = orders.filter((o) => o.customer === userName);
    const isFirstRun = prev.current === null;

    mine.forEach((o) => {
      const before = prev.current?.[o.id];
      if (isFirstRun || before === 'listo' || o.status !== 'listo') return;

      showToast(`Tu pedido ${o.id} está listo para recoger`, 'info');
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.visibilityState !== 'visible'
      ) {
        try {
          new Notification('UDES Food', {
            body: `Tu pedido ${o.id} está listo. Recógelo en la cafetería mostrando tu código.`,
            icon: '/favicon.png',
            tag: o.id,
          });
        } catch { /* si el navegador lo bloquea, el toast ya aviso */ }
      }
    });

    prev.current = Object.fromEntries(mine.map((o) => [o.id, o.status]));
  }, [orders, userName, showToast]);

  return null;
}
