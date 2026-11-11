# ☕ UDES Food — Prototipo de cafetería universitaria

Aplicación web para ordenar y recoger comida en las cafeterías de la **Universidad de Santander (UDES)**. Permite elegir cafetería, armar el pedido, programar la hora de recogida, pagar (simulado o por transferencia con QR) y recibir el aviso cuando el pedido está listo. Incluye un panel de administración para la cola de pedidos, el menú y el stock.

> **Estado:** prototipo funcional / demo. No es un producto en producción. El login es simulado, los pagos no son reales y los datos viven en un servidor local mientras está encendido. Ver [Limitaciones](#-limitaciones).

---

## 🚀 Demo

La demo se comparte por el **túnel de puertos de VS Code** (puerto `5173`). Todos los dispositivos conectados ven los **mismos pedidos, menú y stock**; la sincronización tarda 2-3 segundos.

| Acceso | Credencial |
|---|---|
| Estudiante | cualquier correo válido, ej. `juan@udes.edu.co` |
| Administrador | cualquier correo que empiece por `admin`, ej. `admin@udes.edu.co` |

> Los pedidos, el menú y el stock se guardan en la API local (`app/server/data/state.json`), no en el navegador. El carrito y la cafetería elegida sí son locales de cada dispositivo.

---

## ✨ Funcionalidades

### Estudiante
- **Selector de cafetería**: Cafetería de buses, Cafetería Yariguíes y Cafetería de las Flores.
- **Menú por categorías**: Almuerzos, Desayunos, Bebidas y Snacks y tienda (32 productos con imagen).
- **Menú del día de la Cafetería de buses** (tomado del tablero): almuerzo del día (mesa/para llevar), proteína + 1 acompañante y porciones.
- **Menú fijo semanal de Yariguíes**: costillas BBQ, pechuga a la plancha, cerdo, alitas, lasaña y salchipapa.
- **Productos configurables**:
  - Agua: 300 ml o 600 ml, con o sin gas.
  - Café: americano, latte, capuchino o mocaccino.
  - Empanada: pollo, carne o mixta.
  - Proteína: carne con chimichurri o lomitos de pollo.
  - Proteína + 1 acompañante: proteína + acompañante.
- **Bloqueo de franjas horarias**:
  - Por **cupo lleno** (ej. buses: 7 por franja; Yariguíes: 3).
  - Por **tiempo estimado**: si la cola no alcanza a prepararse antes del cierre.
- **Pago**:
  - Tarjeta (simulada, confirmación inmediata).
  - **Transferencia con código QR**: genera un QR con la referencia del pedido, permite adjuntar comprobante y el pedido queda en *Pago pendiente* hasta que la cafetería lo confirme.
- **Cancelación**: el estudiante puede cancelar mientras el pedido esté *Pago pendiente* o *Recibido*.
- **Mis pedidos** con estados: `Pago pendiente → Recibido → Preparando → Listo`.
- **Avisos**: toast en la app y notificación nativa del navegador (opcional) al quedar listo.
- **Auto-agotado**: al llegar el stock a 0, el producto pasa automáticamente a *Agotado*.

### Administración
- **Cola de pedidos** filtrable por cafetería, con nombre + código del estudiante.
- **Estados**: iniciar preparación, marcar como listo y notificar.
- **Confirmar/rechazar transferencias** (con comprobante adjunto).
- **Cancelar pedidos** en `recibido`, `preparando` o `listo` (devuelve el stock).
- **Sección de cancelados** separada de la cola de preparación.
- **Estadísticas**: pedidos, ingresos, pendientes y pagos por verificar.
- **CRUD de productos**: nombre, descripción, precio, categoría, cafetería, stock, disponibilidad e imagen (URL o subir/tomar foto).

### Transversal
- Diseño responsive (móvil, tablet, escritorio) con tokens de diseño y accesibilidad (foco visible, ARIA, focus trap, objetivos táctiles).
- Datos compartidos entre dispositivos mediante API local + polling.
- Sincronización de la cafetería entre pestañas del mismo navegador.

---

## 🧱 Stack

| Tecnología | Uso |
|---|---|
| **React 19** | UI |
| **Vite 8** | Build tool y dev server |
| **Tailwind CSS 4** | Estilos con design tokens (`app/src/index.css`) |
| **React Router 7** | Navegación SPA |
| **Lucide React** | Iconografía |
| **qrcode** | Generación del código QR de transferencia |
| **Node.js (API nativa)** | Backend local de la demo (`app/server/index.mjs`) |
| **JSON** | Persistencia de la demo (`app/server/data/state.json`) |

---

## 📁 Estructura

```
.
├── app/
│   ├── server/
│   │   ├── index.mjs          # API compartida (pedidos, menú, stock)
│   │   └── data/state.json    # Datos de la demo (ignorado por git)
│   ├── public/img/productos/  # Imágenes locales de los productos
│   ├── src/
│   │   ├── auth/              # (preparado para Supabase, no conectado)
│   │   ├── components/        # UI (ProductCard, Modal, Toast, etc.)
│   │   ├── context/           # StoreContext (API + carrito)
│   │   ├── data/menu.js       # Catálogo, cafeterías y opciones
│   │   ├── lib/               # Dinero, cliente Supabase, capa de datos
│   │   └── pages/             # Login, menú, carrito, checkout, pedidos, admin
│   ├── scripts/               # check-env, verify-seed
│   ├── tests/                 # Vitest + fixtures
│   └── README.md              # Documentación técnica detallada
├── docs/                      # Modelo de datos, activación de cuentas
├── supabase/                  # Esquema, RLS y RPC preparados (sin conectar)
├── .omo/                      # Planificación y borradores del proyecto
└── LICENSE                    # Licencia propietaria
```

---

## 🛠️ Cómo ejecutarlo

Requisitos: **Node.js 20+** y npm.

```bash
cd app
npm install
npm run dev
```

`npm run dev` levanta **dos procesos**:

- Web (Vite): **http://localhost:5173**
- API de la demo: **http://127.0.0.1:8787** (Vite la expone por proxy en `/api`)

### Demo por túnel

1. Deja `npm run dev` corriendo.
2. En VS Code abre **PORTS** → **Forward a Port** → `5173`.
3. Comparte la URL `https://….devtunnels.ms`.
4. Cada persona abre la URL, inicia sesión y ve los mismos pedidos que el resto.

> Solo se expone el puerto **5173**; la API viaja por el proxy de Vite.

### Scripts

```bash
npm run dev        # API + web (demo compartida)
npm run server     # solo API (puerto 8787)
npm run dev:web    # solo web
npm run build      # build de producción
npm run preview    # previsualizar el build
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest
npm run check:seed # compara el seed con el catálogo
```

---

## 💾 Datos y reinicio

- Persistencia: `app/server/data/state.json` (ignorado por git).
- Reiniciar pedidos y stock:

```bash
curl -X POST http://127.0.0.1:8787/api/reset
```

- Borrar todo el estado: elimina `app/server/data/state.json` y reinicia. El catálogo se siembra de nuevo desde `app/src/data/menu.js`.

---

## 🧪 Calidad

- `npm run test` — pruebas unitarias (Vitest) del módulo de dinero y utilidades.
- `npm run typecheck` — TypeScript.
- `npm run lint` — oxlint.
- `npm run check:seed` — el seed de Supabase coincide con el catálogo.
- El esquema, las políticas RLS y las RPC de Supabase están preparados en `supabase/`, pero **no conectados**.

---

## ⚠️ Limitaciones

- **Login simulado**: no hay autenticación real; el rol admin se decide por el prefijo del correo.
- **Pagos simulados**: la tarjeta no cobra; el QR de transferencia es informativo y la confirmación es manual.
- **API local sin autenticación**: úsala solo en un túnel privado y para pruebas. No la expongas públicamente con datos reales.
- **Sin Supabase/Vercel**: la integración está preparada en el código, pero no conectada.
- **Datos compartidos solo mientras el servidor local está encendido**.
- La información de cafeterías (horarios, cupos, precios) es de demostración y debe validarse con la UDES.

---

## 🗺️ Roadmap

1. Conectar **Supabase** (Postgres + RLS + Auth + Storage + Edge Functions) usando el esquema de `supabase/`.
2. **Login institucional real** (correo `@udes.edu.co` validado contra el directorio) y Entra ID opcional.
3. **Pago real** con Wompi (sandbox → producción) y webhook firmado.
4. **Notificaciones por email** (Resend) y notificaciones push.
5. Despliegue en **Vercel** con rewrite SPA, CSP y cron de keepalive.
6. Cumplimiento Ley 1581/2012 (aviso de privacidad, consentimiento con prueba).

---

## 📄 Licencia

**Propietaria — Todos los derechos reservados.** Solo el titular (Edgar Andrés Figueroa Hernández / DEdgamer1123) puede usar, copiar, modificar, distribuir o vender este software. Cualquier uso por terceros requiere autorización previa y por escrito. Ver [LICENSE](./LICENSE).

---

## 👤 Autor

**Edgar Andrés Figueroa Hernández** · [@DEdgamer1123](https://github.com/DEdgamer1123)

Proyecto académico — Universidad de Santander (UDES).
