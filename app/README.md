# 🍽️ UDES Food — Prototipo de app web para la cafetería UDES

Aplicación web (prototipo) para la cafetería de la **Universidad de Santander (UDES)** que permite a los estudiantes **ordenar, pagar y programar su almuerzo** para recogerlo a la hora que escojan, sin hacer filas. Incluye un **panel de administración** para gestionar el menú y la cola de pedidos.

> ⚠️ Prototipo funcional sin backend: los datos viven en `localStorage` del navegador y las imágenes/pagos son simulados.

---

## ✨ Funcionalidades

### 👤 Panel de usuario (estudiantes)
- **Selector de cafetería**: Cafetería de buses, Cafetería Yariguíes y Cafetería de las Flores; esta última **no vende almuerzos ni desayunos**, así que su menú solo muestra bebidas y snacks.
- **Login** con correo institucional (simulado; cualquier correo válido entra).
- **Menú por categorías**: Almuerzos, Desayunos, Bebidas y **Snacks y tienda** (24 productos: paquetes, dulces, bebidas, sándwiches…), todos con imagen local.
- **Carrito** con control de cantidades limitado por el **stock** disponible.
- **Hora de recogida programada** (11:30 a.m. – 2:00 p.m. en intervalos de 15 min) — aparece solo si el carrito contiene un almuerzo (*progressive disclosure*).
- **Bloqueo por cupo y por tiempo**: cada franja tiene cupo por cafetería; cuando se llena muestra **“Sin cupos”** y no se puede seleccionar. También se bloquea si la cola estimada no alcanza a prepararse antes del cierre (**“No alcanza a prepararse antes del cierre”**).
- **Pago simulado con tarjeta** o **pago por transferencia con código QR**: el QR se genera con la referencia del pedido; el pedido queda en **“Pago pendiente”** hasta que la cafetería confirme la transferencia (permite adjuntar comprobante).
- **Mis pedidos** con estados: `Pago pendiente → Recibido → Preparando → ¡Listo para recoger!` (más `Cancelado` y `Expirado`).
- **Notificaciones** cuando el pedido está listo:
  - Toast dentro de la app (en cualquier pantalla y pestaña del navegador).
  - Notificación nativa del navegador (opcional, con permiso del usuario).
- **Auto-agotado**: cuando el stock de un producto llega a 0, pasa automáticamente a **Agotado** y deja de ofrecerse.
- **Aviso de bajo stock** ("Solo quedan X unidades") y productos agotados bloqueados.

### 🛠️ Panel de administración
- Entrar con cualquier correo que empiece por `admin` (ej. `admin@udes.edu.co`).
- **Cola de pedidos** filtrable por cafetería, con acciones: *Iniciar preparación* → *Marcar como listo y notificar*.
- **Confirmación de transferencias**: los pedidos con pago por QR aparecen en *Pagos por verificar* con el comprobante adjunto y botones **Confirmar pago** / **Rechazar** (al rechazar se devuelve el stock).
- **Estadísticas**: pedidos, ingresos, pendientes y pagos por verificar.
- **Gestión del menú (CRUD)** en modal emergente:
  - Crear/editar/eliminar productos (nombre, descripción, precio, categoría y **cafetería**).
  - **Stock manual** con descuento automático al realizar pedidos y **auto-agotado** al llegar a 0.
  - Toggle Disponible / Agotado (no permite “Disponible” con stock 0).
  - Imagen por **URL** o **subir/tomar foto** (redimensionada automáticamente a máx. 600px).

---

## 🧱 Stack técnico

| Tecnología | Uso |
|---|---|
| **React 19** | UI |
| **Vite 8** | Build tool / dev server |
| **Tailwind CSS 4** | Estilos con design tokens (`@theme` en `index.css`) |
| **React Router 7** | Navegación SPA |
| **Lucide React** | Iconografía (sin emojis en la UI) |
| **Context API + localStorage** | Estado global (menú, carrito, pedidos) y sincronización entre pestañas |

---

## 🎨 Principios de diseño aplicados

1. **Ley de Hick** — decisiones mínimas por pantalla: 4 categorías, franjas de hora predefinidas, un flujo claro por paso, 3 métricas esenciales en el admin.
2. **Design tokens** — colores institucionales, tipografía (Montserrat), radios, sombras y duraciones definidos una sola vez en `src/index.css`.
3. **Skeletons** — pantallas de carga esqueleto en menú y pedidos (mejor percepción de velocidad).
4. **Feedback inmediato** (Nielsen) — toasts por cada acción, estados de carga ("Procesando pago…").
5. **Progressive disclosure** — el selector de hora solo aparece cuando hay almuerzo en el carrito; avisos del navegador solo se ofrecen con un botón.
6. **Accesibilidad WCAG** — contraste AA (el dorado decorativo nunca es texto), `aria-label`/roles, skip link, `focus-visible`, focus trap en el modal, objetivos táctiles ≥ 40px, `prefers-reduced-motion`.

---

## 📱 Responsive

Verificado automáticamente (overflow, objetivos táctiles, footer y modal) en **28 resoluciones**, desde **320×568** (celular pequeño) hasta **2560×1440** (monitor 2K), incluyendo Galaxy S20 (360×800), iPhones, iPads y laptops comunes.

- Logo institucional original tomado del sitio oficial `udes.edu.co`.
- Layout con footer fijo abajo usando `min-h-dvh` (respeta la barra del navegador móvil).

---

## 🚀 Cómo ejecutarlo

```bash
cd app
npm install
npm run dev
```

Abrir **http://localhost:5173/**

| Acceso | Credencial |
|---|---|
| Estudiante | cualquier correo válido, ej. `juan@udes.edu.co` |
| Administrador | cualquier correo que empiece por `admin`, ej. `admin@udes.edu.co` |

### Scripts
```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # oxlint
npm run preview  # previsualizar el build
```

> 💡 **Demo con dos paneles a la vez:** abre una pestaña como estudiante y otra como admin; al marcar un pedido como "listo" en el admin, el usuario recibe el aviso en vivo (sincronización vía `localStorage`).

---

## 📁 Estructura

```
app/
├── index.html
├── public/                  # favicon, íconos
└── src/
    ├── main.jsx / App.jsx   # rutas y shell de usuario
    ├── index.css            # design tokens (@theme) + utilidades
    ├── assets/              # logos UDES
    ├── data/menu.js         # menú mock, categorías, franjas de hora, formatCOP
    ├── context/StoreContext.jsx  # estado global: menú, carrito, pedidos, toasts
    ├── components/
    │   ├── Navbar.jsx / Footer.jsx
    │   ├── ProductCard.jsx  # tarjeta de producto (stock, agotado, low-stock)
    │   ├── StatusBadge.jsx  # estados del pedido
    │   ├── Modal.jsx        # modal accesible (focus trap, Esc)
    │   ├── Toast.jsx        # notificaciones dentro de la app
    │   ├── OrderNotifier.jsx# aviso global de "pedido listo" (+ Notification API)
    │   └── Skeletons.jsx    # loaders
    └── pages/
        ├── Login.jsx
        ├── Menu.jsx / Cart.jsx / Checkout.jsx / Orders.jsx
        └── admin/
            ├── AdminLayout.jsx   # shell admin (sidebar → barra en móvil)
            ├── OrdersQueue.jsx   # cola de pedidos + estadísticas
            └── MenuManager.jsx   # CRUD de productos (+ subir foto)
```

---

## 🗺️ Fase 2 (roadmap)

- **SSO real con Microsoft Entra ID** (MSAL.js): el nombre completo y el código del estudiante llegarían del directorio institucional, sin formularios.
- **Backend + base de datos** (menú, pedidos, usuarios, stock persistente). El repositorio ya incluye el esquema, las políticas RLS y las funciones preparadas para Supabase (`supabase/`), pero **no está conectado** todavía: primero se valida el prototipo con el usuario.
- **Pasarela de pago real** para Colombia (Wompi / Mercado Pago). El pago por QR actual es informativo y la confirmación es manual por el admin.
- **Notificaciones push / correo**.
- Roles y permisos reales (cafetería, domicilios, reportes).

---

© 2026 Universidad de Santander · **UDES Food** — prototipo académico.
