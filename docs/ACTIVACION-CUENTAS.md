# Activación de cuentas y credenciales — UDES Food

Este documento es la **precondición humano-gated** del plan: el agente prepara todo lo preparable,
pero cuatro cuentas gratuitas y sus llaves solo las puede crear el dueño del proyecto.

Regla del plan: **BLOCKED ≠ DONE**. Un todo que dependa de un secreto ausente se marca BLOCKED
con el comando y el mensaje exactos; nunca se maquilla como cumplido.

---

## 1. Supabase (base de datos, Auth, Storage y Edge Functions)

1. Crear una cuenta en <https://supabase.com> y un proyecto nuevo (región más cercana: **South America (São Paulo)**).
2. Guardar la contraseña de la base de datos en un gestor de contraseñas (no en el repo).
3. En **Project Settings → API** copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (solo backend, nunca `VITE_*`)
4. En **Account → Access Tokens** crear un token personal → `SUPABASE_ACCESS_TOKEN` (empieza por `sbp_`).
5. En **Authentication → Settings**:
   - Activar *Email confirmations*.
   - Configurar **SMTP propio** con Resend (ver §3): host `smtp.resend.com`, puerto **465**, usuario `resend`, contraseña = API key de Resend.
   - Desactivar el registro de usuarios no institucionales (lo refuerza el trigger de base de datos del todo 10).
6. En **Storage** crear el bucket `productos-imagenes` (lo crea la migración del todo 7, pero se puede crear a mano si se prefiere).

**Límites del plan Free (verificados):** el proyecto se **pausa tras 1 semana de inactividad**; 500 MB de base de datos, 1 GB de Storage, 5 GB de egress. El plan incluye un keepalive diario que **escribe y relee** una fila (no basta un HTTP 200).

---

## 2. Vercel (SPA + funciones serverless + cron)

1. Crear cuenta en <https://vercel.com> con GitHub (gratis, plan Hobby).
2. Importar el repositorio. **Root Directory = `app`** (el repo tiene la SPA dentro de `app/`).
3. Configurar variables de entorno (Production + Preview):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_PROVIDER=email`
   - Las secretas de backend (`SUPABASE_SERVICE_ROLE_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`, `RESEND_API_KEY`) **solo** como variables de servidor, jamás con prefijo `VITE_`.
4. El archivo `app/vercel.json` ya define `rewrites` (fallback SPA), `headers` (CSP) y `crons` (keepalive diario).

**Límites del plan Hobby (verificados):** cron con frecuencia **mínima de 1 vez al día**, en UTC y con ventana de ±59 minutos; 100 GB de ancho de banda/mes; funciones serverless con límite de duración.

---

## 3. Resend (email transaccional)

1. Crear cuenta en <https://resend.com> (gratis).
2. Añadir y **verificar un dominio** (registros DNS SPF/DKIM). Sin dominio verificado solo se puede enviar al correo del propio dueño.
3. Crear una API key → `RESEND_API_KEY` (empieza por `re_`).
4. Definir el remitente verificado → `EMAIL_FROM`, ej. `UDES Food <pedidos@tudominio.com>`.
5. En **Supabase Auth → SMTP** usar `smtp.resend.com:465` con usuario `resend` y la misma API key (los puertos 25/587 están bloqueados en plataformas serverless: para las Edge Functions se usa la **API HTTPS** `https://api.resend.com/emails`, no SMTP).

**Límite del plan Free (verificado):** **100 emails/día y 3 000/mes**, compartidos entre correos de Auth y avisos de pedidos. Por eso la escala objetivo es **≤40 pedidos/día** y el plan incluye cola + comportamiento at-cap (el pedido nunca se pierde por un email).

---

## 4. Wompi (pagos, sandbox primero)

1. Crear cuenta de comercio en <https://wompi.co> y solicitar el modo **sandbox**.
2. En el panel de desarrolladores copiar:
   - Llave pública de sandbox → `WOMPI_PUBLIC_KEY` (`pub_test_…`)
   - Llave privada de sandbox → `WOMPI_PRIVATE_KEY` (`prv_test_…`, solo backend)
   - Secreto de eventos → `WOMPI_EVENTS_SECRET` (`events_test_…`, solo backend)
3. Registrar la **URL de eventos** apuntando a la Edge Function: `https://<ref>.supabase.co/functions/v1/wompi-webhook`.
4. `WOMPI_ENV=sandbox`.

**Hechos verificados:** sandbox y producción son entornos **independientes** (llaves y URL de eventos propias); una `reference` repetida devuelve **422 (rechazo, no idempotencia)**; las consultas de estado solo admiten llaves `prv_`; el webhook se reintenta **3 veces en 24 h**.

---

## Tabla completa de variables

| Variable | Para qué | Dónde se obtiene | ¿Secreta? |
|---|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API | No (pública) |
| `VITE_SUPABASE_ANON_KEY` | Cliente Supabase (protegido por RLS) | Supabase → Settings → API | No (pública) |
| `SUPABASE_ACCESS_TOKEN` | CLI de Supabase | Supabase → Account → Access Tokens | **Sí** |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend / scripts (salta RLS) | Supabase → Settings → API | **Sí** |
| `VITE_AUTH_PROVIDER` | `email` o `entra` | Decisión de configuración | No |
| `VITE_ENTRA_CLIENT_ID` | App registrada en Entra ID | Azure Portal → App registrations | No |
| `VITE_ENTRA_TENANT_ID` | Tenant de la UDES | Azure Portal → Entra ID | No |
| `VITE_ENTRA_REDIRECT_URI` | Retorno del login Microsoft | Configuración de la app | No |
| `WOMPI_PUBLIC_KEY` | Checkout en el navegador | Panel Wompi | No (pública) |
| `WOMPI_PRIVATE_KEY` | Crear transacción y consultar estado | Panel Wompi | **Sí** |
| `WOMPI_EVENTS_SECRET` | Validar el webhook | Panel Wompi → Eventos | **Sí** |
| `WOMPI_ENV` | `sandbox` o `prod` | Decisión de entorno | No |
| `RESEND_API_KEY` | Enviar emails | Resend → API Keys | **Sí** |
| `EMAIL_FROM` | Remitente verificado | Resend → Domains | No |
| `APP_URL` | Enlaces de correos y retornos | Dominio del despliegue | No |
| `ADMIN_EMAIL` | Primer administrador | Correo institucional del dueño | No |

---

## Cómo validar sin credenciales

```bash
node app/scripts/check-env.mjs --demo   # exit 0, 16 variables ficticias
node app/scripts/check-env.mjs          # valida app/.env.local (nunca imprime valores)
```

## Qué queda bloqueado sin estas cuentas

- Aplicar migraciones a un proyecto real (`supabase db push`).
- Ejecutar la pila local (`supabase start`) — requiere Docker Desktop.
- Desplegar en Vercel y probar el rewrite/headers en un dominio real.
- Enviar un email real y probar el tope diario.
- Crear una transacción real de sandbox y recibir el webhook.

Todo lo demás (esquema SQL, RLS, RPC, handlers, frontend, tests con mocks, CI, documentación)
se implementa y verifica **sin ninguna llave**.
