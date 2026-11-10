---
slug: udes-food-production
status: plan-written
intent: clear
review_required: false
pending-action: ejecutar el plan con $ulw-execute udes-food-production
approach: Convert the localStorage React prototype into a deployable production product: React SPA + Supabase (Postgres + Auth + Storage) + serverless backend for PSP webhooks, real payment (one Colombian gateway), transactional email for order-ready notifications, server-authoritative catalog/stock/orders with RLS, CI + tests + TypeScript, and a Vercel deployment with a SPA history fallback. Identity is built behind an auth-provider adapter so Entra ID (Microsoft) can be enabled later without touching product code.
plan: .omo/plans/udes-food-production.md (39 todos + 4 verificadores finales; copia legible en app/PLAN-PRODUCCION.md)
---

# Draft: udes-food-production

## Affected user and ideal state

**Affected users**
- U1 — Estudiante UDES (celular, en fila o entre clases): hoy usa un prototipo donde todo vive en su navegador; después ordena, paga y recibe aviso real en cualquier dispositivo.
- U2 — Operador de cafetería (admin): hoy marca pedidos en su propio navegador sin ver los del resto; después ve la cola real, sabe a quién llamar por nombre+código, y el stock no se puede falsear.
- U3 — Persona desarrolladora / evaluador del proyecto: hoy no hay git, ni tests, ni CI, ni docs de despliegue; después clona, `npm ci`, corre una suite y despliega con un comando documentado.
- U4 — UDES/TI (institución): hoy no hay datos ni contratos; después hay aviso de privacidad, consentimiento con prueba, y la posibilidad de auditar pedidos y pagos.

**Ideal state rows (IS)**
- IS-1 | El estudiante se autentica con una identidad institucional real y su nombre completo aparece en el pedido | el operador y el estudiante se reconocen en la bandeja (razón: lo acordado con el usuario: "nombre + código estilo Uber").
- IS-2 | Menú, precios y stock son datos del servidor, editables por el admin y visibles por todos al instante | el admin no depende del navegador ni del localStorage (razón: hoy el menú es un seed local, `app/src/data/menu.js:11-22`).
- IS-3 | El stock se descuenta en el servidor de forma atómica al confirmar el pago | hoy el stock se recalcula en cada cliente (`app/src/context/StoreContext.jsx:88-93`) y dos pestañas pueden sobrevender.
- IS-4 | El estudiante ve el menú real sin esperas falsas (skeletons solo si la red tarda) | hoy hay timers de 700 ms/600 ms/1500 ms simulando latencia (`Menu.jsx:24`, `Orders.jsx:15`, `Checkout.jsx:24`).
- IS-5 | El pago se procesa en una pasarela real y el estado del pedido lo confirma el webhook del proveedor, no el navegador | hoy el pago es un `setTimeout` y un radio button (`Checkout.jsx:22-29`).
- IS-6 | El estudiante recibe un aviso real (email transaccional) cuando su pedido está listo, aunque no tenga la app abierta | hoy el aviso solo existe mientras la pestaña del usuario está viva (`OrderNotifier.jsx:23-35`).
- IS-7 | Solo el personal autorizado entra al panel admin y solo ve lo que le corresponde | hoy "admin" es un prefijo de correo decidido en el cliente (`Login.jsx:19`, `App.jsx:33-37`).
- IS-8 | El estudiante solo ve sus propios pedidos y sus datos no son editables por terceros | hoy la propiedad se decide comparando texto libre (`Orders.jsx:12`, `OrderNotifier.jsx:15`).
- IS-9 | La app funciona bien en celular, tablet y escritorio (lo ya verificado en 28 resoluciones no se pierde) | los overrides responsive actuales deben sobrevivir al backend.
- IS-10 | Existe control de versiones, suite de tests, CI que bloquea regresiones y despliegue documentado | hoy no hay git, ni runner, ni CI (`explore` §4, §7).
- IS-11 | Los datos personales se tratan conforme a la Ley 1581/2012 y el Decreto 1377/2013: aviso de privacidad, consentimiento explícito con prueba almacenada, y registro del responsable | el piloto almacenaría nombre y código de estudiante.
- IS-12 | El proyecto se puede entregar y defender: README de producción, variables de entorno documentadas, diagrama de flujo de orden→pago→notificación | el README actual describe la fase 2 como "roadmap" (`app/README.md:124-133`).

**Gap rows (GAP) — cada uno se cierra por al menos un todo**
- GAP-1 | Sin backend ni capa de API: cero `fetch`/env vars en `app/src` (grep 0 coincidencias) → IS-2, IS-3, IS-8.
- GAP-2 | Autenticación simulada, rol en cliente, sesión solo en memoria (refrescar = deslogueado) → IS-1, IS-7.
- GAP-3 | Pago simulado, sin tokenización ni webhook → IS-5.
- GAP-4 | Notificación solo intra-navegador (Notification API + evento `storage`) → IS-6.
- GAP-5 | Base de datos = localStorage; base64 de imágenes satura la cuota ~5 MB y no hay guarda de cuota (`StoreContext.jsx:28-29`) → IS-2.
- GAP-6 | Cero tests, cero CI, sin git, sin formateador, sin TypeScript (los `@types/*` ya están instalados pero sin `tsconfig`) → IS-10.
- GAP-7 | Sin ruta de despliegue: falta fallback de SPA para `BrowserRouter` (`App.jsx:41`), falta `base`/proxy en `vite.config.js:5-7`, `dist/` obsoleto y versionado → IS-10.
- GAP-8 | Endurecimiento ausente: sin CSP/SRI (`index.html:1-14`), fuente e imágenes desde CDN externo (`index.css:1`, `data/menu.js:12-21`), sin allow-list de esquema para URL de imagen (`MenuManager.jsx:109-112`), `.env` no ignorado (`.gitignore:1-24`) → IS-10, IS-11.
- GAP-9 | Sin cumplimiento de datos personales: no hay aviso de privacidad, ni consentimiento con prueba, ni registro RNBD → IS-11.
- GAP-10 | Códigos de pedido `UD-####` aleatorios de 4 dígitos y colisionables (`StoreContext.jsx:79`); estadísticas "hoy" que cuentan todo el histórico (`OrdersQueue.jsx:19,23-24`) → IS-2, IS-3.
- GAP-11 | Sin observabilidad: no hay logging de errores, métricas ni forma de diagnosticar fallos de webhook o de pago → IS-5, IS-6.
- GAP-12 | Assets muertos (`src/assets/logo-header.png`, `src/assets/vite.svg`, `public/icons.svg` con símbolos de terceros) y `dist/` obsoleto en el árbol → IS-10.
- GAP-13 | README afirma verificación responsive "automática en 28 resoluciones" sin script en el repo (`README.md:61`) → IS-9, IS-10.

## Components (topology ledger)
- C1 | Datos y persistencia: esquema Postgres, migraciones, RLS, storage de imágenes, seed del menú | active | `app/src/context/StoreContext.jsx:9-10,23-29`
- C2 | Identidad y roles: proveedor de auth (Entra ID y/o email-OTP) detrás de un adaptador, mapeo a rol estudiante/admin | active | `app/src/pages/Login.jsx:13-22`, `app/src/App.jsx:33-37`
- C3 | Dominio de pedidos: catálogo y stock autoritativos en servidor, franjas de recogida, transiciones de estado, reserva de stock | active | `app/src/context/StoreContext.jsx:47-93`, `app/src/components/StatusBadge.jsx:7`
- C4 | Pagos: integración con una pasarela colombiana, idempotencia, webhook firmado, estados APPROVED/DECLINED/ERROR | active | `app/src/pages/Checkout.jsx:22-29`
- C5 | Notificaciones: email transaccional al evento "pedido listo" (+ push como complemento opcional) | active | `app/src/components/OrderNotifier.jsx:13-39`
- C6 | Entrega y operación: git, TypeScript, tests, CI, despliegue, variables de entorno, observabilidad, documentación | active | `app/package.json:6-26`, `app/vite.config.js:5-7`
- C7 | Cumplimiento de datos personales: aviso de privacidad, consentimiento con prueba, política, registro RNBD | active | externo (Ley 1581/2012, Decreto 1377/2013, SIC) |

## Owner answers (this round)
- Q1 Identidad | "La UDES no va a aprobar todavía, pero el login debe quedar real y funcional" → **Elegido: Supabase Auth (email + contraseña) con dominio institucional restringido (`@udes.edu.co`) + roles en `app_metadata` + directorio de estudiantes en tabla `estudiantes` (nombre por código) administrable desde el panel**. El login es real (hash, sesión, refresh, logout), no simulado, y no depende de TI. **Entra ID (MSAL v5) queda detrás de un adaptador `AuthProvider` activable con un flag** cuando la UDES registre la app.
- Q2 Pasarela | "Aún no lo sé" → **Default: adaptador `PaymentProvider` + primera implementación Wompi** (sandbox primero; onboarding y UX los más sencillos en Colombia, idempotencia natural por referencia única, webhook `X-Event-Checksum`). Comparativo MP/PayU queda en el README de producción; añadir otro proveedor = un adapter más.
- Q3 Presupuesto | "Solo planes gratuitos" → **Elegido: 100% free tier** — Vercel Hobby (SPA + functions + cron diario), Supabase Free (Postgres/Auth/Storage/RLS) **con mitigación de la pausa por inactividad (ping cron diario)**, Resend free (100/día) para emails, Wompi sandbox. Se documenta el "trigger de upgrade a pago" (cuando entre dinero real: Supabase Pro, Vercel Pro, Wompi producción).

## Open assumptions (announced defaults)
- Idioma del producto y del código: español (consistente con el código actual).
- TypeScript: se migra el frontend a TS (los `@types/react` ya están instalados, `package.json:20-21`) porque el estado de pedidos/stock pasa a ser contratos de API y tipos de DB.
- Estrategia de tests: tests-after con Vitest + Testing Library (componentes) y Playwright (flujos E2E críticos: login→orden→pago→aviso). | reversible | QA siempre ejecutado por el agente, sin intervención humana.
- Migración de datos del prototipo: no se migra el localStorage del navegador (es de demostración); el menú mock pasa a seed reproducible en la DB.
- Los pedidos y pagos quedan en COP con enteros (sin centavos), como el modelo actual.
- Los precios los define el admin en el panel; no hay catálogo de productos pre-cargado por el proveedor.
- La app se despliega en un solo host (SPA + funciones serverless del mismo proveedor) para minimizar configuración de CORS y dominios.
- Notificación push (Web Push/PWA) queda FUERA del alcance inicial; email transaccional es el canal principal.
- **Canal de notificación (default, veto-able):** email transaccional vía Resend (100/día gratis) + toast en vivo dentro de la app. WhatsApp Business queda documentado como opción de pago posterior (fuera del plan gratuito).
- **Pasarela (default, veto-able):** Wompi como primera implementación del adaptador `PaymentProvider`; se implementa y se prueba en sandbox y el checklist de activación a producción (datos legales de la UDES + llaves `prv_`/`events_`) queda en el README.
- **Escala objetivo (default, veto-able):** piloto de 1 sede, ≤500 estudiantes registrados, ≤100 pedidos/día — encaja en los límites gratuitos; el plan documenta qué se rompe al superarlo.
- **Identidad de datos (default):** la identidad del estudiante es `auth.uid()` (no el correo ni el nombre); el nombre visible sale de `estudiantes` (código → nombre) y el rol de `app_metadata.role`.
- **Migración de contraseñas/datos del prototipo:** no aplica (no hay usuarios reales); se siembran productos del menú mock en la DB con script de seed reproducible.

## Findings (cited - path:lines)
- Repo: `C:\Users\Pc\Downloads\PROTOTIPO CAFETERIA\app` — SPA React 19 + Vite 8 + Tailwind 4 + React Router 7 + lucide-react; sin backend, sin env vars, sin tests, sin CI, sin git (`explore` §1-§7).
- Auth simulada: `app/src/pages/Login.jsx:15` (regex de correo), `:19` (admin = prefijo "admin"), `app/src/App.jsx:18` (sesión en `useState`), `:33-37` (gate de rol en cliente).
- Persistencia: `app/src/context/StoreContext.jsx:9-10` (claves `udesfood_orders`, `udesfood_menu`), `:23` (seed `MENU`), `:28-29` (escrituras sin try/catch), `:32-39` (sync entre pestañas con `JSON.parse` sin guarda).
- Pago simulado: `app/src/pages/Checkout.jsx:22-29` (`setTimeout` 1500 ms), `:77` ("Método de pago (simulado)").
- Notificación actual: `app/src/components/OrderNotifier.jsx:23-35` (Notification API + `visibilityState`), `app/src/components/Navbar.jsx:10-23` (opt-in).
- Stock y códigos: `app/src/context/StoreContext.jsx:79` (`UD-${1000+rand*9000}`), `:88-93` (stock en cliente).
- Endurecimiento: `app/index.html:1-14` (sin CSP), `app/src/index.css:1` (Montserrat desde CDN), `app/src/pages/admin/MenuManager.jsx:109-112` (URL de imagen sin allow-list), `app/.gitignore:1-24` (no ignora `.env`).
- QA/infra ausentes: `app/package.json:6-11` (scripts sin `test`), `app/.oxlintrc.json:1-8` (2 reglas), sin `.github/`, sin `tsconfig*`, sin formateador; `app/dist/` obsoleto.
- Git: el workspace no es repositorio (`git status` → "not a git repository").
- Externos verificados: MSAL v5 activo / v2 LTS (v3-v4 sin soporte) — https://learn.microsoft.com/en-us/entra/msal/javascript/ ; redirect URI `http://localhost` y SPA obligatoria — https://learn.microsoft.com/en-us/entra/identity-platform/reply-url ; claims `name`, `oid`, `roles` — https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference ; Wompi (`pub_/prv_/events_`, referencia repetida → 422, webhook `X-Event-Checksum`) — https://docs.wompi.co/en/docs/colombia/transacciones/ y https://docs.wompi.co/en/docs/colombia/eventos/ ; Mercado Pago (preferencia en backend, `X-Idempotency-Key`, webhook firmado `x-signature`) — https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/configure-back-urls y https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-orders/resources/notifications/webhooks ; PayU CO (`notifyUrl` + whitelist de IPs + firma MD5/SHA256) — https://developers.payulatam.com/latam/en/docs/integrations/confirmation-url.html ; Supabase Free se pausa tras 1 semana de inactividad, Pro $25 — https://supabase.com/pricing ; Vercel región `gru1` São Paulo + cron — https://vercel.com/docs/regions ; iOS Web Push solo en PWA instalada — https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ ; Ley 1581/2012 y Decreto 1377/2013 (consentimiento expreso, aviso de privacidad, prueba, RNBD) — http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html y https://sedeelectronica.sic.gov.co/politica-de-tratamiento-de-datos-personales.

## Decisions (with rationale)
- Backend único Supabase (Postgres + Auth + Storage + Edge Functions) + SPA en Vercel `gru1`: menos superficies que operar, RLS nativo para(IS-7/IS-8), evita la pausa del plan Free. Alternativas (Neon/Firebase/Render) revisadas en findings.
- Todo el estado autoritativo (menú, stock, pedidos, estados de pago) vive en Postgres; el `StoreContext` se convierte en capa de caché/lectura, no de fuente de verdad (cierra GAP-1, GAP-3, GAP-5).
- Identidad detrás de un adaptador `AuthProvider` con dos implementaciones: Entra ID (MSAL v5) y email-OTP de Supabase; el rol se resuelve SIEMPRE en el servidor (JWT/app_metadata), nunca en el cliente (cierra GAP-2).
- El estado de pago lo decide el webhook firmado del proveedor; la redirección al navegador solo informa (contrato verificado de Wompi/MP/PayU).
- Idempotencia: `reference`/referencia única de Wompi (422 en duplicado) o `X-Idempotency-Key` de MP, más `payment_intent_id` único en DB (cierra GAP-10).
- Notificación principal por email transaccional; el `OrderNotifier` del navegador queda como mejora UX en vivo (polling/sus Realtime), no como canal fiable (cierra GAP-4).
- Consentimiento explícito con casilla no preseleccionada + registro de prueba en tabla `consentimientos` (cierra GAP-9, alineado con Decreto 1377 art. 5-8).
- Se elimina la dependencia de CDNs externos para fuentes e imágenes del menú (self-host de Montserrat, imágenes en Supabase Storage) y se agrega CSP (cierra GAP-8).
- Se inicializa git en la raíz del workspace con `.gitignore` ampliado (`.env*`, `dist`, `node_modules`, `*.local`) antes de cualquier otro trabajo (cierra parte de GAP-6, GAP-7).
- Se elimina el script de verificación responsive inventado del README o se materializa como script real versionado (cierra GAP-13) — decisión: materializarlo (`scripts/verify-responsive.mjs`).

## Scope IN
- Backend + DB + RLS + storage; auth real (OTP hoy, Entra ID detrás de flag); pagos reales con una pasarela; notificaciones por email; CI + tests + TS; despliegue Vercel + variables de entorno + observabilidad básica (errores, healthcheck de webhook, log de eventos de pedido); hardening (CSP, allow-list de URL de imagen, self-host de assets); cumplimiento de datos personales (aviso, consentimiento, política, checklist RNBD); limpieza de assets muertos y `dist/`; README de producción y diagrama de flujo.

## Scope OUT (Must NOT have)
- No dominios a domicilio, no delivery externo, no horarios de tienda fuera de las franjas 11:30-14:00 existentes.
- No app móvil nativa (iOS/Android) — solo PWA opcional como complemento.
- No multi-sede / multi-tenant, no multi-idioma, no i18n.
- No loyalty points, cupos, reseñas, comentarios, chat con la cafetería.
- No facturación electrónica / DIAN, no contabilidad, no inventario de insumos más allá del stock por producto.
- No refactor del diseño visual: se conservan tokens, componentes, decisiones responsive y accesibilidad ya validadas (no rehacer el front).
- No maka "sistema completo deRRHH" ni datos académico del estudiante: solo nombre, código y correo institucional.
- No WhatsApp Business API en la primera versión (se documenta como opción).

## Open questions
- Q1-Q3 | RESUELTAS por el usuario (ver "Owner answers"). Q4 (canal de notificación) y Q5 (estrategia de tests) quedan como defaults anunciados arriba, veto-ables en el gate.
- Q6 | Ninguna bloqueante. Todo lo que sigue es default reversible y queda explícito en el brief para que lo vetees.

## Metis gap analysis - resolutions (P0 first)
- C-1 auth | una sola vía: **email + contraseña** (Supabase Auth) con dominio `@udes.edu.co` restringido + verificación de código contra `estudiantes`. "OTP" eliminado del draft.
- C-2 free tier vs pago real | IS-5 reescrita: el flujo se implementa contra la API real de Wompi y se valida en **sandbox**; la **activación a producción es entregable humano-gated** (datos legales UDES + llaves `prv_prod_`/`prod_events_`). El plan NO promete cobrar dinero real.
- C-3 host del webhook | **Supabase Edge Functions** (secreto de eventos + service-role junto a la DB); SPA en Vercel. Keepalive: **pg_cron** (primario) con fallback a cron diario de Vercel Hobby.
- C-4 unidad de dinero | canonónico = **COP entero**; conversión a `amount_in_cents = precio * 100` SOLO en el borde del gateway, en un único módulo `money` con tests (12 000 COP → 1 200 000 centavos).
- C-5 forma de integración Wompi | **Wompi Web Checkout por redirección** (sin iframe) → el CSP no necesita `frame-src` de terceros; solo `connect-src` a nuestras APIs.
- C-6 identidad | IS-1 reescrita: identidad = correo institucional verificado + **código registrado en `estudiantes`**; un alta con correo `@udes.edu.co` sin código no puede ordenar.
- C-7 stock | regla única: **reserva** al crear el pedido (TTL 15 min) + **decremento** al aprobar el pago; liberación al expirar/fallar/cancelar.
- C-8 bootstrap admin | primer admin por script humano-gated (correo admin en env, ejecutado por el dueño del proyecto); los cambios de rol quedan auditados en `eventos`.
- C-10 observabilidad | redefinida: tabla `eventos` (durable) + logs estructurados en stdout. Proveedor externo (Sentry) **diferido**.
- C-11 TypeScript | **diferido**: TS solo en la capa de datos y código nuevo de backend (`tsconfig` con `allowJs`); el JSX actual no se migra (colisiona con "no refactor visual" y no aporta seguridad en runtime).
- C-12 datos | whitelist ampliada: nombre, código, correo institucional, **IP de checkout capturada en backend** (recomendación Wompi) y metadatos de consentimiento.
- C-13 GAP-7 | `dist/` ya está ignorado (`.gitignore:11`): el requisito real es **`vercel.json` con rewrite SPA** + `dist` fuera del árbol.
- C-15 efectivo | **eliminado** de checkout v1 (Wompi no cobra efectivo); queda como nota en README.
- C-17 ledger | componentes re-balanceados: C1 posee `productos`, `estudiantes`, `slots`; C3 `pedidos`, `pedido_items`; C4 `pagos`; C7 `consentimientos`, `eventos`.
- C-18 assets | se conservan los logos institucionales (identidad real del proyecto) y se eliminan `public/icons.svg` (símbolos de terceros) y `src/assets/vite.svg`, `logo-header.png` sin uso.
- Landmines free tier (P0) | Supabase Free pausa a los 7 días → keepalive `pg_cron` que **escribe y relee** una fila (afirmar efecto, no HTTP 200) + fallback cron diario Vercel (Hobby: mínimo 1/día, UTC, ±59 min); Resend 100/día y 3 000/mes → presupuesto de dos flujos (Auth vs pedidos) + comportamiento at-cap (cola, sin perder pedidos); SMTP propio obligatorio (el SMTP por defecto de Supabase son 2 mensajes/hora a correos del equipo) vía Resend `smtp.resend.com:465`, y las Edge Functions usan la API HTTPS (puertos 25/587 bloqueados); Wompi sandbox y producción son entornos **independientes** con URL de eventos propia, `signature.properties` variable, consultas de estado solo con `prv_`, webhook reintentado 3 veces en 24 h → handler replay-safe; `reference` duplicada → **422 (rechazo, no idempotencia)** → reconciliar consultando por reference.
- QA no negociable | RLS cross-account (0 filas), role escalation (self-registered sin rol admin), stock race (exactamente 1 pedido ganador), webhook replay (3 POST → 1 transición), checksum alterado → 4xx sin cambio de estado, 422 → mismo pedido, unidad de dinero (1 200 000 centavos), consent proof (versión de política + timestamp + fila nueva al re-consentir), CI gate (test roto → run rojo), keepalive con read-back.
- Escala ajustada | **≤40 pedidos/día** (el tope de Resend de 100/día debe cubrir pedidos + correos de Auth con margen). Documentar qué se rompe al superarlo.
- Deferred explícitos | migración TS del SPA, script de 28 resoluciones (→ Playwright con 4 viewports en 4 rutas), proveedor de observabilidad, Realtime (→ polling), Entra ID E2E (solo interfaz + test de contrato), PWA/push, refunds/voids (pero la máquina de estados SÍ maneja `VOIDED`), RNBD (checklist humano-gated), comparación MP/PayU (solo README).

## Approval gate
status: approved — plan escrito
<!-- Approach (aprobado por el usuario): SPA React+TS en Vercel Hobby (gru1, cron diario) + Supabase Free (Postgres/RLS/Auth/Storage/Edge Functions, con ping anti-pausa) + autenticación real email+contraseña con dominio @udes.edu.co y directorio `estudiantes` (nombre por código) + adaptador `AuthProvider` con Entra ID (MSAL v5) detrás de flag + adaptador `PaymentProvider` con Wompi sandbox (webhook firmado, idempotencia) + email transaccional Resend para "pedido listo" + TypeScript + Vitest/Playwright + CI (lint/types/tests/build) + hardening (CSP, assets self-host, allow-list de imágenes, .env ignorado) + consentimiento y aviso de privacidad + git + README de producción. 100% free tier con trigger de upgrade documentado. -->
<!-- Siguiente acción: el usuario ejecuta el plan en una sesión aparte con `$ulw-execute udes-food-production`. No hay implementación en esta sesión. -->
<!-- Artefactos: .omo/plans/udes-food-production.md (canónico, 39 todos + F1-F4), .omo/drafts/udes-food-production.md (memoria de decisiones), app/PLAN-PRODUCCION.md (copia legible dentro de la carpeta del proyecto). -->

## Cambio de alcance — 2026-11-10 (vigente)

El dueño decidió **posponer la conexión con Supabase, el login real y el despliegue en Vercel**:

- Supabase: el código (esquema, RLS, RPC, handlers pendientes) **se mantiene en el repo** pero **no se conecta** todavía.
- Login real: **no se puede** hasta conectar la base de datos de la universidad → se conserva el login simulado del prototipo.
- Vercel: **no se despliega** por ahora.
- El prototipo (localStorage) se amplió con: selector de **3 cafeterías** (nombres placeholder; una **no vende almuerzos**), **bloqueo de franjas por cupo lleno y por tiempo estimado**, **pago por transferencia con QR** (confirmación manual del admin) y **auto-agotado** cuando el stock llega a 0.
- Catálogo ampliado a **25 productos** (paquetes, dulces, bebidas, sándwiches, combos).
- Los todos 2–9 del plan quedaron ejecutados a nivel de código; la verificación en base de datos queda BLOCKED hasta que el dueño cree el proyecto Supabase.
- Siguiente paso cuando el dueño lo decida: crear el proyecto Supabase, aplicar migraciones y migrar el prototipo al backend.

