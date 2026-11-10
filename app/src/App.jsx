import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Toast from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OrderNotifier from './components/OrderNotifier';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminLayout from './pages/admin/AdminLayout';
import MenuManager from './pages/admin/MenuManager';
import OrdersQueue from './pages/admin/OrdersQueue';

export default function App() {
  const [user, setUser] = useState(null);

  const UserShell = () => (
    // min-h-dvh: usa la altura real del viewport (en celulares el vh
    // clasico se corta por la barra del navegador)
    <div className="flex min-h-dvh flex-col">
      <Navbar user={user} onLogout={() => setUser(null)} />
      <OrderNotifier userName={user?.name} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );

  const RequireAuth = ({ children, role }) => {
    if (!user) return <Navigate to="/" replace />;
    if (role && user.role !== role) return <Navigate to="/menu" replace />;
    return children;
  };

  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/menu'} /> : <Login onLogin={setUser} />} />

          <Route element={<RequireAuth><UserShell /></RequireAuth>}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/pedidos" element={<Orders user={user} />} />
          </Route>

          <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout onLogout={() => setUser(null)} /></RequireAuth>}>
            <Route index element={<Navigate to="pedidos" replace />} />
            <Route path="pedidos" element={<OrdersQueue />} />
            <Route path="menu" element={<MenuManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </StoreProvider>
  );
}
