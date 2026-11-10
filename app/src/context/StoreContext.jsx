import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  CAFETERIAS,
  MENU,
  MINUTOS_ALMUERZO,
  MINUTOS_OTRO,
  PICKUP_SLOTS,
  cafeteriaPorId,
  etiquetaOpciones,
  precioConOpciones,
} from '../data/menu';

// Estado global de la demo:
// - Menú, pedidos y stock viven en el servidor local (api /api) para que
//   todos los dispositivos conectados por el túnel vean lo mismo.
// - Cafetería seleccionada y carrito son locales de cada navegador.

const StoreContext = createContext(null);
const LS_CAFETERIA = 'udesfood_cafeteria';
const API = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function claveSeleccion(seleccion) {
  return Object.keys(seleccion ?? {})
    .sort()
    .map((k) => `${k}:${seleccion[k]}`)
    .join('|');
}

function minutosDeItems(items, cafeteria) {
  const porAlmuerzo = cafeteria?.minutosPorAlmuerzo ?? MINUTOS_ALMUERZO;
  return (items ?? []).reduce(
    (total, item) => total + (item.isLunch ? porAlmuerzo : MINUTOS_OTRO) * (item.qty ?? 1),
    0
  );
}

function minutosHastaCierre(cafeteria, hora) {
  if (!cafeteria) return 0;
  const [h, m] = hora.split(':').map(Number);
  const [ch, cm] = cafeteria.horarioCierre.split(':').map(Number);
  return ch * 60 + cm - (h * 60 + m);
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(MENU);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [cafeteriaId, setCafeteriaId] = useState(() => load(LS_CAFETERIA, null));
  const [toast, setToast] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refresh = useCallback(async () => {
    const data = await apiFetch('/state');
    if (Array.isArray(data.products)) setProducts(data.products);
    if (Array.isArray(data.orders)) setOrders(data.orders);
    setApiOnline(true);
  }, []);

  // Arranque: siembra el catálogo una vez y sincroniza cada 2.5 s
  useEffect(() => {
    let activo = true;

    const init = async () => {
      try {
        await apiFetch('/seed', {
          method: 'POST',
          body: JSON.stringify({ products: MENU }),
        });
        if (activo) await refresh();
      } catch {
        if (!activo) return;
        setApiOnline(false);
        showToast(
          'Servidor de demo no disponible. Inicia la app con "npm run dev".',
          'warning'
        );
      }
    };

    init();
    const timer = setInterval(() => {
      refresh().catch(() => setApiOnline(false));
    }, 2500);

    return () => {
      activo = false;
      clearInterval(timer);
    };
  }, [refresh, showToast]);

  useEffect(() => {
    if (cafeteriaId) localStorage.setItem(LS_CAFETERIA, JSON.stringify(cafeteriaId));
    else localStorage.removeItem(LS_CAFETERIA);
  }, [cafeteriaId]);

  // Sincroniza la cafetería entre pestañas del mismo navegador
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_CAFETERIA) setCafeteriaId(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const cafeteriaActual = useMemo(() => cafeteriaPorId(cafeteriaId), [cafeteriaId]);

  // ---- Cafetería ----
  const setCafeteria = useCallback(
    (id) => {
      const caf = cafeteriaPorId(id);
      if (!caf) return;

      const incompatible = cart.some(
        (i) =>
          (i.category === 'almuerzos' && !caf.vendeAlmuerzos) ||
          (i.category === 'desayunos' && !caf.vendeDesayunos)
      );
      if (incompatible) {
        setCart((c) =>
          c.filter(
            (i) =>
              (i.category !== 'almuerzos' || caf.vendeAlmuerzos) &&
              (i.category !== 'desayunos' || caf.vendeDesayunos)
          )
        );
        showToast('Quitamos los productos que esa cafetería no vende', 'warning');
      }

      setCafeteriaId(id);
    },
    [cart, showToast]
  );

  // ---- Carrito (local) ----
  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? Infinity;

  const addToCart = (product, seleccion = null) => {
    const disponible = product.stock ?? 0;
    const enCarrito = cart
      .filter((i) => i.id === product.id)
      .reduce((s, i) => s + i.qty, 0);

    if (enCarrito >= disponible) {
      showToast(`Solo quedan ${disponible} unidades de ${product.name}`, 'warning');
      return;
    }

    const sel = seleccion ?? {};
    const lineId = product.options?.length
      ? `${product.id}::${claveSeleccion(sel)}`
      : String(product.id);
    const price = precioConOpciones(product, sel);
    const optionsLabel = etiquetaOpciones(product, sel);

    setCart((c) => {
      const found = c.find((i) => i.lineId === lineId);
      return found
        ? c.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...product, price, qty: 1, lineId, seleccion: sel, optionsLabel }];
    });

    showToast(
      optionsLabel
        ? `${product.name} (${optionsLabel}) agregado al carrito`
        : `${product.name} agregado al carrito`
    );
  };

  const removeFromCart = (lineId) => setCart((c) => c.filter((i) => i.lineId !== lineId));

  const setQty = (lineId, qty) =>
    setCart((c) => {
      if (qty <= 0) return c.filter((i) => i.lineId !== lineId);
      return c.map((i) => {
        if (i.lineId !== lineId) return i;
        const stock = stockOf(i.id);
        const otras = c
          .filter((x) => x.id === i.id && x.lineId !== lineId)
          .reduce((s, x) => s + x.qty, 0);
        const max = Math.max(0, stock - otras);
        return { ...i, qty: Math.min(qty, max) };
      });
    });

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartHasLunch = useMemo(() => cart.some((i) => i.isLunch), [cart]);
  const minutosCarrito = useMemo(
    () => minutosDeItems(cart, cafeteriaActual),
    [cart, cafeteriaActual]
  );

  // ---- Productos visibles ----
  const productosVisibles = useMemo(() => {
    if (!cafeteriaActual) return [];
    return products.filter((p) => {
      if (p.cafeteriaId && p.cafeteriaId !== cafeteriaActual.id) return false;
      if (p.category === 'almuerzos' && !cafeteriaActual.vendeAlmuerzos) return false;
      if (p.category === 'desayunos' && !cafeteriaActual.vendeDesayunos) return false;
      return true;
    });
  }, [products, cafeteriaActual]);

  // ---- Franjas ----
  const slotStatus = useCallback(
    (cafeteria) => {
      const caf = cafeteria ?? cafeteriaActual;
      if (!caf) return [];

      return PICKUP_SLOTS.map((hora) => {
        const activos = orders.filter(
          (o) =>
            o.cafeteriaId === caf.id &&
            o.pickupTime === hora &&
            ['pendiente_pago', 'recibido', 'preparando'].includes(o.status)
        );

        const carga = activos.reduce((s, o) => s + minutosDeItems(o.items, caf), 0);
        const capacidad = minutosHastaCierre(caf, hora);
        const restante = Math.max(0, caf.cupoPorFranja - activos.length);
        const sinCupo = restante <= 0;
        const tiempoEstimado = carga + minutosDeItems(cart, caf);
        const noAlcanza = tiempoEstimado > capacidad;

        let motivo = null;
        if (sinCupo) motivo = 'Sin cupos';
        else if (noAlcanza) motivo = 'No alcanza a prepararse antes del cierre';

        return {
          hora,
          activos: activos.length,
          cupoMax: caf.cupoPorFranja,
          restante,
          carga,
          capacidad,
          tiempoEstimado,
          bloqueada: Boolean(motivo),
          motivo,
        };
      });
    },
    [cafeteriaActual, orders, cart]
  );

  // ---- Pedidos (servidor) ----
  const placeOrder = async ({ pickupTime, customer, paymentMethod = 'tarjeta', receipt = null }) => {
    if (!cafeteriaActual) return null;

    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({ id: i.id, qty: i.qty, seleccion: i.seleccion ?? {} })),
          cafeteriaId: cafeteriaActual.id,
          cafeteriaNombre: cafeteriaActual.nombre,
          customer,
          pickupTime,
          paymentMethod,
          receipt,
        }),
      });
      await refresh();
      return order;
    } catch (e) {
      showToast(e.message || 'No se pudo crear el pedido', 'warning');
      return null;
    }
  };

  const patchOrder = async (id, patch) => {
    try {
      await apiFetch(`/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      await refresh();
      return true;
    } catch (e) {
      showToast(e.message || 'No se pudo actualizar el pedido', 'warning');
      return false;
    }
  };

  const setOrderStatus = (id, status) => patchOrder(id, { status });
  const confirmTransfer = (id) => patchOrder(id, { status: 'recibido' });
  const rejectTransfer = (id) => patchOrder(id, { status: 'cancelado' });
  const attachReceipt = (id, receipt) => patchOrder(id, { receipt });

  // ---- Admin: productos (servidor) ----
  const saveProduct = async (p) => {
    try {
      if (p.id) {
        await apiFetch(`/products/${encodeURIComponent(p.id)}`, {
          method: 'PATCH',
          body: JSON.stringify(p),
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(p),
        });
      }
      await refresh();
      return true;
    } catch (e) {
      showToast(e.message || 'No se pudo guardar el producto', 'warning');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiFetch(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      return true;
    } catch (e) {
      showToast(e.message || 'No se pudo eliminar el producto', 'warning');
      return false;
    }
  };

  const toggleAvailable = async (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    if (!p.available && (p.stock ?? 0) <= 0) {
      showToast('No puedes marcarlo disponible: no hay stock', 'warning');
      return;
    }
    try {
      await apiFetch(`/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ available: !p.available }),
      });
      await refresh();
    } catch (e) {
      showToast(e.message || 'No se pudo actualizar el producto', 'warning');
    }
  };

  const value = {
    cafeterias: CAFETERIAS,
    cafeteriaActual,
    cafeteriaId,
    setCafeteria,
    products,
    productosVisibles,
    cart,
    orders,
    toast,
    apiOnline,
    showToast,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartTotal,
    cartCount,
    cartHasLunch,
    minutosCarrito,
    slotStatus,
    placeOrder,
    setOrderStatus,
    confirmTransfer,
    rejectTransfer,
    attachReceipt,
    saveProduct,
    deleteProduct,
    toggleAvailable,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
