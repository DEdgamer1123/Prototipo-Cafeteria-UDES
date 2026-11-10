#!/usr/bin/env node
/**
 * check-env.mjs — valida las variables de entorno de UDES Food.
 *
 * Reglas de oro:
 *  - NUNCA imprime valores, solo nombres de variables y OK/FALTANTE/INVÁLIDA.
 *  - `--demo` valida contra un fixture interno (16 variables ficticias).
 *  - Sin argumentos, valida `app/.env.local` (o la ruta de `--file`).
 *
 * Uso:
 *   node app/scripts/check-env.mjs
 *   node app/scripts/check-env.mjs --demo
 *   node app/scripts/check-env.mjs --file app/.env.local
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, '..');

/** Definición de variables: nombre → { required, validate?, hint } */
const RULES = {
  VITE_SUPABASE_URL: {
    required: true,
    validate: (v) => /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(v.replace(/\/$/, '')),
    hint: 'https://<ref>.supabase.co (sin barra final)',
  },
  VITE_SUPABASE_ANON_KEY: {
    required: true,
    validate: (v) => v.length > 40,
    hint: 'anon/public key del proyecto',
  },
  SUPABASE_ACCESS_TOKEN: {
    required: true,
    validate: (v) => v.startsWith('sbp_'),
    hint: 'token personal de la CLI (sbp_…)',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    validate: (v) => v.length > 40,
    hint: 'service_role key (solo backend)',
  },
  VITE_AUTH_PROVIDER: {
    required: true,
    validate: (v) => ['email', 'entra'].includes(v),
    hint: 'email | entra',
  },
  VITE_ENTRA_CLIENT_ID: {
    required: false,
    validate: (v) => /^[0-9a-f-]{36}$/i.test(v),
    hint: 'GUID de la app registrada (solo entra)',
  },
  VITE_ENTRA_TENANT_ID: {
    required: false,
    validate: (v) => /^[0-9a-f-]{36}$/i.test(v) || v === 'common' || v === 'organizations',
    hint: 'GUID del tenant o common',
  },
  VITE_ENTRA_REDIRECT_URI: {
    required: false,
    validate: (v) => /^https?:\/\//.test(v),
    hint: 'http://localhost:5173 en desarrollo',
  },
  WOMPI_PUBLIC_KEY: {
    required: true,
    validate: (v) => v.startsWith('pub_'),
    hint: 'pub_… (sandbox: pub_test_…)',
  },
  WOMPI_PRIVATE_KEY: {
    required: true,
    validate: (v) => v.startsWith('prv_'),
    hint: 'prv_… (solo backend)',
  },
  WOMPI_EVENTS_SECRET: {
    required: true,
    validate: (v) => v.startsWith('events_') || v.length >= 16,
    hint: 'events_… (solo backend)',
  },
  WOMPI_ENV: {
    required: true,
    validate: (v) => ['sandbox', 'prod'].includes(v),
    hint: 'sandbox | prod',
  },
  RESEND_API_KEY: {
    required: true,
    validate: (v) => v.startsWith('re_'),
    hint: 're_… (solo backend)',
  },
  EMAIL_FROM: {
    required: true,
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /<[^\s@]+@[^\s@]+\.[^\s@]+>$/.test(v),
    hint: 'UDES Food <pedidos@tudominio.com>',
  },
  APP_URL: {
    required: true,
    validate: (v) => /^https?:\/\//.test(v),
    hint: 'http://localhost:5173 o el dominio de producción',
  },
  ADMIN_EMAIL: {
    required: true,
    validate: (v) => /@udes\.edu\.co$/i.test(v),
    hint: 'correo @udes.edu.co del primer admin',
  },
};

/** Fixture de demostración: 16 variables ficticias que SÍ pasan el formato. */
const DEMO = {
  VITE_SUPABASE_URL: 'https://demo-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'demo-anon-key-' + 'x'.repeat(60),
  SUPABASE_ACCESS_TOKEN: 'sbp_' + 'd'.repeat(40),
  SUPABASE_SERVICE_ROLE_KEY: 'demo-service-role-' + 'y'.repeat(60),
  VITE_AUTH_PROVIDER: 'email',
  VITE_ENTRA_CLIENT_ID: '00000000-0000-0000-0000-000000000000',
  VITE_ENTRA_TENANT_ID: '00000000-0000-0000-0000-000000000000',
  VITE_ENTRA_REDIRECT_URI: 'http://localhost:5173',
  WOMPI_PUBLIC_KEY: 'pub_test_demo',
  WOMPI_PRIVATE_KEY: 'prv_test_demo',
  WOMPI_EVENTS_SECRET: 'events_test_demo_secret',
  WOMPI_ENV: 'sandbox',
  RESEND_API_KEY: 're_demo_key',
  EMAIL_FROM: 'UDES Food <pedidos@example.com>',
  APP_URL: 'http://localhost:5173',
  ADMIN_EMAIL: 'admin@udes.edu.co',
};

function parseEnvFile(path) {
  const raw = readFileSync(path, 'utf8');
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function parseArgs(argv) {
  const args = { demo: false, file: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--demo') args.demo = true;
    else if (argv[i] === '--file' && argv[i + 1]) args.file = argv[++i];
  }
  return args;
}

function validate(env, label) {
  const problems = [];
  let checked = 0;

  for (const [name, rule] of Object.entries(RULES)) {
    const value = env[name];

    if (!value) {
      if (rule.required) problems.push({ name, status: 'FALTANTE', hint: rule.hint });
      continue;
    }

    checked++;
    if (rule.validate && !rule.validate(value)) {
      problems.push({ name, status: 'INVALIDA', hint: rule.hint });
    }
  }

  // Reglas cruzadas
  if (env.VITE_AUTH_PROVIDER === 'entra') {
    for (const name of ['VITE_ENTRA_CLIENT_ID', 'VITE_ENTRA_TENANT_ID']) {
      if (!env[name]) problems.push({ name, status: 'FALTANTE', hint: RULES[name].hint });
    }
  }
  if (env.WOMPI_PRIVATE_KEY && env.WOMPI_PUBLIC_KEY) {
    const privTest = env.WOMPI_PRIVATE_KEY.includes('test');
    const pubTest = env.WOMPI_PUBLIC_KEY.includes('test');
    if (privTest !== pubTest) {
      problems.push({
        name: 'WOMPI_PUBLIC_KEY/WOMPI_PRIVATE_KEY',
        status: 'INCONSISTENTE',
        hint: 'las llaves sandbox (test) y producción no se mezclan',
      });
    }
  }

  console.log(`\nValidando entorno: ${label}\n`);
  if (checked === 0 && problems.length === 0) {
    console.log('  (sin variables que validar)');
  }

  if (problems.length === 0) {
    console.log(`  OK — ${checked} variables presentes y con formato válido.`);
    console.log('  (los valores no se imprimen por seguridad)\n');
    return 0;
  }

  console.log('  Variables con problema (solo se muestra el NOMBRE, nunca el valor):');
  for (const p of problems) {
    console.log(`   - ${p.name}: ${p.status} — esperado: ${p.hint}`);
  }
  console.log(`\n  ${problems.length} problema(s). Revisa app/.env.example.\n`);
  return 1;
}

const args = parseArgs(process.argv.slice(2));

if (args.demo) {
  const code = validate(DEMO, 'fixture de demostración (--demo)');
  process.exit(code);
}

const file = args.file ? resolve(process.cwd(), args.file) : resolve(APP_ROOT, '.env.local');

let env;
try {
  env = parseEnvFile(file);
} catch {
  console.error(`\nNo se pudo leer: ${file}`);
  console.error('Crea app/.env.local a partir de app/.env.example.');
  console.error('Para probar el validador sin credenciales: node app/scripts/check-env.mjs --demo\n');
  process.exit(1);
}

process.exit(validate(env, file));
