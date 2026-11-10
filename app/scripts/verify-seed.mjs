#!/usr/bin/env node
/**
 * verify-seed.mjs — comprueba que `supabase/seed.sql` coincide con el catálogo
 * del prototipo (`app/src/data/menu.js`).
 *
 * Compara por nombre: precio, categoria, es_almuerzo y stock.
 * Exit 0 = coinciden; exit 1 = drift detectado (nombra el producto y los valores).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const MENU = resolve(ROOT, 'app', 'src', 'data', 'menu.js');
const SEED = resolve(ROOT, 'supabase', 'seed.sql');

function parseMenu() {
  const lines = readFileSync(MENU, 'utf8').split(/\r?\n/);
  const out = [];
  const re =
    /name:\s*'([^']+)'.*?price:\s*(\d+),\s*category:\s*'([^']+)',\s*isLunch:\s*(true|false).*?stock:\s*(\d+)/;
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    out.push({
      nombre: m[1],
      precio: Number(m[2]),
      categoria: m[3],
      es_almuerzo: m[4] === 'true',
      stock: Number(m[5]),
    });
  }
  return out;
}

function parseSeed() {
  const sql = readFileSync(SEED, 'utf8');
  // Cada tupla: (uuid, null, 'Nombre', 'desc', PRECIO, 'categoria', es_almuerzo, disponible, STOCK, 0, null)
  const re =
    /\(\s*'[0-9a-f-]+'\s*,\s*null\s*,\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*(\d+)\s*,\s*'(almuerzos|desayunos|bebidas|snacks)'\s*,\s*(true|false)\s*,\s*(?:true|false)\s*,\s*(\d+)\s*,\s*0\s*,\s*null\s*\)/gi;
  const out = [];
  let m;
  while ((m = re.exec(sql)) !== null) {
    out.push({
      nombre: m[1],
      precio: Number(m[2]),
      categoria: m[3],
      es_almuerzo: m[4] === 'true',
      stock: Number(m[5]),
    });
  }
  return out;
}

const menu = parseMenu();
const seed = parseSeed();

if (menu.length === 0) {
  console.error('No se pudo parsear app/src/data/menu.js (¿cambió el formato?)');
  process.exit(1);
}
if (seed.length === 0) {
  console.error('No se pudo parsear supabase/seed.sql (¿cambió el formato?)');
  process.exit(1);
}

const byName = new Map(seed.map((p) => [p.nombre, p]));
const problems = [];

for (const expected of menu) {
  const actual = byName.get(expected.nombre);
  if (!actual) {
    problems.push(`FALTA en seed.sql: "${expected.nombre}"`);
    continue;
  }
  for (const key of ['precio', 'categoria', 'es_almuerzo', 'stock']) {
    if (actual[key] !== expected[key]) {
      problems.push(
        `DRIFT "${expected.nombre}" · ${key}: esperado ${expected[key]}, seed ${actual[key]}`
      );
    }
  }
  byName.delete(expected.nombre);
}

for (const extra of byName.keys()) {
  problems.push(`EXTRA en seed.sql (no está en menu.js): "${extra}"`);
}

console.log(`\nProductos en menu.js: ${menu.length}`);
console.log(`Productos en seed.sql:  ${seed.length}\n`);

if (problems.length === 0) {
  console.log(`OK — ${menu.length}/${menu.length} productos coinciden (nombre, precio, categoría, es_almuerzo, stock).\n`);
  process.exit(0);
}

console.log('Diferencias encontradas:');
for (const p of problems) console.log(`  - ${p}`);
console.log(`\n${problems.length} diferencia(s). Corrige supabase/seed.sql o menu.js.\n`);
process.exit(1);
