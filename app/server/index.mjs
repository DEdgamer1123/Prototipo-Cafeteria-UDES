import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const STATE_FILE = join(DATA_DIR, 'state.json');
const PORT = Number(process.env.DEMO_PORT || 8787);

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Estado compartido de la demo (persistido en JSON). */
let state = { seeded: false, products: [], orders: [] };

async function loadState() {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    state = {
      seeded: Boolean(parsed.seeded),
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    /* primera ejecución */
  }
}

async function saveState() {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STATE_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
  await rename(tmp, STATE_FILE);
}

function generarCodigo() {
  for (let intento = 0; intento < 30; intento++) {
    const bytes = randomBytes(6);
    let sufijo = '';
    for (let i = 0; i < 6; i++) sufijo += ALFABETO[bytes[i] % ALFABETO.length];
    const id = `UD-${sufijo}`;
    if (!state.orders.some((o) => o.id === id)) return id;
  }
  return `UD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function claveSeleccion(seleccion = {}) {
  return Object.keys(seleccion)
    .sort()
    .map((k) => `${k}:${seleccion[k]}`)
    .join('|');
}

function precioConOpciones(product, seleccion = {}) {
  let price = product.price;
  for (const group of product.options ?? []) {
    const choice = group.choices.find((c) => c.id === seleccion[group.id]);
    if (choice && typeof choice.price === 'number') price = choice.price;
  }
  return price;
}

function etiquetaOpciones(product, seleccion = {}) {
  const parts = [];
  for (const group of product.options ?? []) {
    const choice = group.choices.find((c) => c.id === seleccion[group.id]);
    if (choice) parts.push(choice.label);
  }
  return parts.join(' · ');
}

function opcionesCompletas(product, seleccion = {}) {
  return (product.options ?? []).every((g) => !g.required || Boolean(seleccion[g.id]));
}

function normalizarProducto(p) {
  const stock = Math.max(0, Number(p.stock) || 0);
  return {
    ...p,
    id: p.id ?? Date.now(),
    price: Math.max(0, Number(p.price) || 0),
    stock,
    available: stock > 0 ? Boolean(p.available ?? true) : false,
  };
}

function construirPedido(payload) {
  const { items, cafeteriaId, cafeteriaNombre, customer, pickupTime, paymentMethod, receipt } =
    payload ?? {};

  if (!Array.isArray(items) || items.length === 0) return { error: 'El pedido no tiene items' };
  if (!cafeteriaId) return { error: 'Falta la cafetería' };

  const normalizados = [];
  const cantidades = new Map();

  for (const item of items) {
    const product = state.products.find((p) => p.id === item.id);
    if (!product) return { error: `Producto no encontrado (${item.id})` };

    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: 'Cantidad inválida' };
    if (!product.available) return { error: `${product.name} está agotado` };

    const seleccion = item.seleccion ?? {};
    if (!opcionesCompletas(product, seleccion)) {
      return { error: `Elige las opciones de ${product.name}` };
    }

    normalizados.push({
      id: product.id,
      lineId: `${product.id}::${claveSeleccion(seleccion)}`,
      name: product.name,
      price: precioConOpciones(product, seleccion),
      qty,
      seleccion,
      optionsLabel: etiquetaOpciones(product, seleccion),
      isLunch: Boolean(product.isLunch),
      category: product.category,
      image: product.image ?? null,
    });

    cantidades.set(product.id, (cantidades.get(product.id) ?? 0) + qty);
  }

  for (const [id, qty] of cantidades) {
    const product = state.products.find((p) => p.id === id);
    if ((product.stock ?? 0) < qty) {
      return { error: `Stock insuficiente para ${product.name}` };
    }
  }

  // Descuenta stock y auto-agota
  for (const [id, qty] of cantidades) {
    const product = state.products.find((p) => p.id === id);
    product.stock = Math.max(0, (product.stock ?? 0) - qty);
    if (product.stock === 0) product.available = false;
  }

  const total = normalizados.reduce((s, i) => s + i.price * i.qty, 0);

  return {
    order: {
      id: generarCodigo(),
      items: normalizados,
      total,
      pickupTime: pickupTime ?? null,
      customer: customer ?? 'estudiante',
      cafeteriaId,
      cafeteriaNombre: cafeteriaNombre ?? 'Cafetería',
      paymentMethod: paymentMethod === 'transferencia' ? 'transferencia' : 'tarjeta',
      receipt: receipt ?? null,
      status: paymentMethod === 'transferencia' ? 'pendiente_pago' : 'recibido',
      createdAt: new Date().toISOString(),
    },
  };
}

const TRANSICIONES = {
  pendiente_pago: ['recibido', 'cancelado'],
  recibido: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: [],
  cancelado: [],
  expirado: [],
};

function restaurarStock(order) {
  if (order.stockRestored) return;
  for (const item of order.items ?? []) {
    const product = state.products.find((p) => p.id === item.id);
    if (!product) continue;
    product.stock = (product.stock ?? 0) + item.qty;
    if (product.stock > 0) product.available = true;
  }
  order.stockRestored = true;
}

async function leerBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  try {
    if (path === '/api/health') return json(res, 200, { ok: true });

    if (path === '/api/state' && req.method === 'GET') {
      return json(res, 200, {
        seeded: state.seeded,
        products: state.products,
        orders: state.orders,
      });
    }

    if (path === '/api/seed' && req.method === 'POST') {
      if (state.seeded) return json(res, 200, { ok: true, seeded: true });
      const body = await leerBody(req);
      if (!Array.isArray(body.products)) return json(res, 400, { error: 'products inválido' });
      state.products = body.products.map((p) => {
        const normalizado = normalizarProducto(p);
        return { ...normalizado, stockInicial: normalizado.stock };
      });
      state.seeded = true;
      await saveState();
      return json(res, 200, { ok: true, seeded: true });
    }

    if (path === '/api/orders' && req.method === 'POST') {
      const body = await leerBody(req);
      const { order, error } = construirPedido(body);
      if (error) return json(res, 400, { error });
      state.orders.unshift(order);
      await saveState();
      return json(res, 201, order);
    }

    const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'PATCH') {
      const order = state.orders.find((o) => o.id === decodeURIComponent(orderMatch[1]));
      if (!order) return json(res, 404, { error: 'Pedido no encontrado' });
      const body = await leerBody(req);

      if (body.receipt !== undefined) {
        order.receipt = body.receipt;
        await saveState();
        return json(res, 200, order);
      }

      const status = body.status;
      if (!status) return json(res, 400, { error: 'Falta el estado' });
      if (!(TRANSICIONES[order.status] ?? []).includes(status)) {
        return json(res, 400, { error: `Transición no permitida: ${order.status} → ${status}` });
      }
      if (status === 'cancelado') restaurarStock(order);
      order.status = status;
      await saveState();
      return json(res, 200, order);
    }

    if (path === '/api/products' && req.method === 'POST') {
      const body = await leerBody(req);
      if (!body.name) return json(res, 400, { error: 'Falta el nombre' });
      const product = normalizarProducto({ ...body, id: body.id ?? Date.now() });
      state.products.push({ ...product, stockInicial: product.stock });
      await saveState();
      return json(res, 201, product);
    }

    const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch) {
      const id = decodeURIComponent(productMatch[1]);
      const index = state.products.findIndex((p) => String(p.id) === id);
      if (index === -1) return json(res, 404, { error: 'Producto no encontrado' });

      if (req.method === 'PATCH') {
        const body = await leerBody(req);
        state.products[index] = normalizarProducto({ ...state.products[index], ...body, id: state.products[index].id });
        await saveState();
        return json(res, 200, state.products[index]);
      }

      if (req.method === 'DELETE') {
        state.products.splice(index, 1);
        await saveState();
        return json(res, 200, { ok: true });
      }
    }

    if (path === '/api/reset' && req.method === 'POST') {
      state.orders = [];
      state.products = state.products.map((p) => ({ ...p, stock: p.stockInicial ?? p.stock }));
      await saveState();
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'No encontrado' });
  } catch (e) {
    console.error('[api]', e);
    return json(res, 500, { error: e.message });
  }
});

await loadState();
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] Demo compartida en http://127.0.0.1:${PORT}`);
  console.log(`[api] Datos: ${STATE_FILE}`);
});
