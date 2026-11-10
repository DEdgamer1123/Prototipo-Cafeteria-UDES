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

// Estado global del prototipo: cafeterÃ­a seleccionada, menÃº (admin),
// carrito y pedidos. Se sincroniza con localStorage para que el panel
// usuario y el panel admin "conversen" dentro del mismo navegador (demo).

const StoreContext = createContext(null);
const LS_ORDERS = 'udesfood_orders';
const LS_MENU = 'udesfood_menu';
const LS_CAFETERIA = 'udesfood_cafeteria';
const LS_MENU_VERSION = 'udesfood_menu_version';
// Subir esta versiÃ³n cuando cambie el catÃ¡logo base (fuerza un re-seed
// en navegadores que ya habÃ­an cargado el prototipo).
const MENU_VERSION = '7';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarCodigo(existentes) {
  for (let intento = 0; intento < 10; intento++) {
    let sufijo = '';
    for (let i = 0; i < 6; i++) {
      sufijo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
    }
    const id = `UD-${sufijo}`;
    if (!existentes.some((o) => o.id === id)) return id;
  }
  return `UD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function minutosDeItems(items, cafeteria) {
  const porAlmuerzo = cafeteria?.minutosPorAlmuerzo ?? MINUTOS_ALMUERZO;
  return (items ?? []).reduce(
    (total, item) => total + (item.isLunch ? porAlmuerzo : MINUTOS_OTRO) * (item.qty ?? 1),
    0
  );
}

function claveSeleccion(seleccion) {
  return Object.keys(seleccion ?? {})
    .sort()
    .map((k) => `${k}:${seleccion[k]}`)
    .join('|');
}

function minutosHastaCierre(cafeteria, hora) {
  if (!cafeteria) return 0;
  const [h, m] = hora.split(':').map(Number);
  const [ch, cm] = cafeteria.horarioCierre.split(':').map(Number);
  return ch * 60 + cm - (h * 60 + m);
}

export function StoreProvider({ children }) {
  // Normaliza stock para menÃºs antiguos guardados en localStorage (sin campo stock).
  // Si cambiÃ³ la versiÃ³n del catÃ¡logo, re-siembra con el menÃº actual.
  const [products, setProducts] = useState(() => {
    const normalize = (list) =>
      list.map((p) => ({
        stock: 10,
        available: true,
        cafeteriaId: null,
        image: null,
        ...p,
      }));

    try {
      if (localStorage.getItem(LS_MENU_VERSION) !== MENU_VERSION) {
        localStorage.setItem(LS_MENU_VERSION, MENU_VERSION);
        return normalize(MENU);
      }
    } catch {
      /* localStorage no disponible */
    }

    return normalize(load(LS_MENU, MENU));
  });
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => load(LS_ORDERS, []));
  const [cafeteriaId, setCafeteriaId] = useState(() => load(LS_CAFETERIA, null));
  const [toast, setToast] = useState(null);

  useEffect(() => localStorage.setItem(LS_ORDERS, JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem(LS_MENU, JSON.stringify(products)), [products]);
  useEffect(() => {
    if (cafeteriaId) localStorage.setItem(LS_CAFETERIA, JSON.stringify(cafeteriaId));
    else localStorage.removeItem(LS_CAFETERIA);
  }, [cafeteriaId]);

  // Sincroniza pestaÃ±as (usuario y admin abiertos a la vez)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_ORDERS && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === LS_MENU && e.newValue) setProducts(JSON.parse(e.newValue));
      if (e.key === LS_CAFETERIA) setCafeteriaId(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const cafeteriaActual = useMemo(() => cafeteriaPorId(cafeteriaId), [cafeteriaId]);

  // ---- CafeterÃ­a ----
  const setCafeteria = useCallback(
    (id) => {
      const caf = cafeteriaPorId(id);
      if (!caf) return;

      // Si la cafeterÃ­a no vende almuerzos/desayunos, no se puede llevar esos Ã­tems.
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
        showToast('Quitamos los productos que esa cafeterÃ­a no vende', 'warning');
      }

      setCafeteriaId(id);
    },
    [cart, showToast]
  );

  // ---- Carrito ----
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

  // ---- Productos visibles para la cafeterÃ­a seleccionada ----
  const productosVisibles = useMemo(() => {
    if (!cafeteriaActual) return [];
    return products.filter((p) => {
      if (p.cafeteriaId && p.cafeteriaId !== cafeteriaActual.id) return false;
      if (p.category === 'almuerzos' && !cafeteriaActual.vendeAlmuerzos) return false;
      if (p.category === 'desayunos' && !cafeteriaActual.vendeDesayunos) return false;
      return true;
    });
  }, [products, cafeteriaActual]);

  // ---- Estado de las franjas: cupo + estimaciÃ³n de tiempo ----
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

  // ---- Pedidos ----
  const placeOrder = ({ pickupTime, customer, paymentMethod = 'tarjeta', receipt = null }) => {
    if (!cafeteriaActual) return null;
    if (cartHasLunch && !cafeteriaActual.vendeAlmuerzos) {
      showToast('Esa cafeterÃ­a no vende almuerzos', 'warning');
      return null;
    }

    const order = {
      id: generarCodigo(orders),
      items: cart,
      total: cartTotal,
      pickupTime, // null si no hay almuerzo
      customer,
      cafeteriaId: cafeteriaActual.id,
      cafeteriaNombre: cafeteriaActual.nombre,
      paymentMethod, // 'tarjeta' | 'transferencia'
      receipt, // dataURL del comprobante (solo transferencia)
      status: paymentMethod === 'transferencia' ? 'pendiente_pago' : 'recibido',
      createdAt: new Date().toISOString(),
    };

    // Descuenta el stock y auto-marca "Agotado" al llegar a 0
    setProducts((list) =>
      list.map((p) => {
        const cantidad = cart
          .filter((i) => i.id === p.id)
          .reduce((s, i) => s + i.qty, 0);
        if (!cantidad) return p;
        const nextStock = Math.max(0, (p.stock ?? 0) - cantidad);
        return {
          ...p,
          stock: nextStock,
          available: nextStock > 0 ? p.available : false,
        };
      })
    );
    setOrders((o) => [order, ...o]);
    clearCart();
    return order;
  };

  const setOrderStatus = (id, status) => {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status } : ord)));
  };

  // El admin confirma una transferencia: el pedido entra a la cola.
  const confirmTransfer = (id) => {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status: 'recibido' } : ord)));
  };

  // El admin rechaza una transferencia: se devuelve el stock.
  const rejectTransfer = (id) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setProducts((list) =>
        list.map((p) => {
          const cantidad = order.items
            .filter((i) => i.id === p.id)
            .reduce((s, i) => s + i.qty, 0);
          if (!cantidad) return p;
          const nextStock = (p.stock ?? 0) + cantidad;
          return { ...p, stock: nextStock, available: nextStock > 0 ? true : p.available };
        })
      );
    }
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status: 'cancelado' } : ord)));
  };

  // Adjunta o reemplaza el comprobante de una transferencia.
  const attachReceipt = (id, receipt) => {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, receipt } : ord)));
  };

  // ---- Admin: productos ----
  const saveProduct = (p) => {
    const stock = Math.max(0, Number(p.stock) || 0);
    const normalized = {
      ...p,
      stock,
      // Auto-agotado: nunca queda "Disponible" con stock 0
      available: stock > 0 ? Boolean(p.available) : false,
    };
    setProducts((list) =>
      p.id
        ? list.map((it) => (it.id === p.id ? normalized : it))
        : [...list, { ...normalized, id: Date.now() }]
    );
  };
  const deleteProduct = (id) => setProducts((list) => list.filter((p) => p.id !== id));
  const toggleAvailable = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    if (!p.available && (p.stock ?? 0) <= 0) {
      showToast('No puedes marcarlo disponible: no hay stock', 'warning');
      return;
    }
    setProducts((list) =>
      list.map((item) => (item.id === id ? { ...item, available: !item.available } : item))
    );
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

