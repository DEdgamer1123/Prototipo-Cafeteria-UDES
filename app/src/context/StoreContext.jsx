import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { MENU } from '../data/menu';

// Estado global del prototipo: menu (admin), carrito y pedidos.
// Se sincroniza con localStorage para que el panel usuario y el
// panel admin "conversen" dentro del mismo navegador (demo).

const StoreContext = createContext(null);
const LS_ORDERS = 'udesfood_orders';
const LS_MENU = 'udesfood_menu';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  // Normaliza stock para menus antiguos guardados en localStorage (sin campo stock)
  const [products, setProducts] = useState(() => load(LS_MENU, MENU).map((p) => ({ stock: 10, ...p })));
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => load(LS_ORDERS, []));
  const [toast, setToast] = useState(null);

  useEffect(() => localStorage.setItem(LS_ORDERS, JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem(LS_MENU, JSON.stringify(products)), [products]);

  // Sincroniza pestañas (usuario y admin abiertos a la vez)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_ORDERS && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === LS_MENU && e.newValue) setProducts(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Carrito ----
  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? Infinity;

  const addToCart = (product) => {
    const inCart = cart.find((i) => i.id === product.id)?.qty ?? 0;
    if (inCart >= stockOf(product.id)) {
      showToast(`Solo quedan ${stockOf(product.id)} unidades de ${product.name}`, 'warning');
      return;
    }
    setCart((c) => {
      const found = c.find((i) => i.id === product.id);
      return found
        ? c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...product, qty: 1 }];
    });
    showToast(`${product.name} agregado al carrito`);
  };
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const setQty = (id, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.id !== id)
        : c.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, stockOf(id)) } : i))
    );
  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartHasLunch = useMemo(() => cart.some((i) => i.isLunch), [cart]);

  // ---- Pedidos ----
  const placeOrder = ({ pickupTime, customer }) => {
    const order = {
      id: `UD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart,
      total: cartTotal,
      pickupTime, // null si no hay almuerzo
      customer,
      status: 'recibido', // recibido -> preparando -> listo
      createdAt: new Date().toISOString(),
    };
    // Descuenta el stock de lo pedido
    setProducts((list) =>
      list.map((p) => {
        const item = cart.find((i) => i.id === p.id);
        return item ? { ...p, stock: Math.max(0, (p.stock ?? 0) - item.qty) } : p;
      })
    );
    setOrders((o) => [order, ...o]);
    clearCart();
    return order;
  };

  const setOrderStatus = (id, status) => {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status } : ord)));
  };

  // ---- Admin: productos ----
  const saveProduct = (p) =>
    setProducts((list) =>
      p.id ? list.map((it) => (it.id === p.id ? p : it)) : [...list, { ...p, id: Date.now() }]
    );
  const deleteProduct = (id) => setProducts((list) => list.filter((p) => p.id !== id));
  const toggleAvailable = (id) =>
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));

  const value = {
    products, cart, orders, toast, showToast,
    addToCart, removeFromCart, setQty, clearCart, cartTotal, cartCount, cartHasLunch,
    placeOrder, setOrderStatus,
    saveProduct, deleteProduct, toggleAvailable,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
