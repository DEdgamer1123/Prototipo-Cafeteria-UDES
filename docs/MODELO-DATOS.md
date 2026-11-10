# Modelo de datos — UDES Food (producción)

Fuente de verdad del esquema. Las migraciones viven en `supabase/migrations/` y deben coincidir con este documento.

## Convenciones

- **Dinero**: COP entero (`integer`), nunca float. `monto_centavos = monto * 100` solo en el borde del gateway.
- **Identidad**: `auth.uid()` es la identidad real. `estudiantes.id = auth.users.id`.
- **Rol**: única fuente de verdad `estudiantes.rol` (`student` | `admin`), leída por `es_admin()` (SECURITY DEFINER). El JWT no otorga rol por sí solo.
- **Tiempo**: `timestamptz` en UTC; las métricas de "hoy" se calculan en `America/Bogota`.
- **Borrado**: los pedidos no se borran; se cancelan/expiran. `pedido_items` cae en cascada con el pedido (nunca se borra un pedido, así que en la práctica no ocurre).

## Tablas

### `cafeterias`
Puntos de recogida de la UDES. **Sin seed**: las crea el admin desde `/admin/cafeterias`.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `nombre` | text NOT NULL | nombre real definido por el admin |
| `sede` | text | campus/sede |
| `direccion` | text | referencia física |
| `telefono` | text | contacto de la cafetería |
| `vende_almuerzos` | boolean NOT NULL DEFAULT true | si es false, no se le pueden pedir almuerzos |
| `activo` | boolean NOT NULL DEFAULT true | las inactivas no aparecen al estudiante |
| `horario_apertura` | time NOT NULL DEFAULT '11:00' | |
| `horario_cierre` | time NOT NULL DEFAULT '15:00' | límite para estimar tiempos |
| `creado_en` / `actualizado_en` | timestamptz | trigger `set_updated_at` |

### `productos`
Catálogo. `cafeteria_id` nullable = producto disponible en el catálogo base (visible para todas las cafeterías activas).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `cafeteria_id` | uuid FK → cafeterias | `on delete set null` |
| `nombre` | text NOT NULL | 3..80 caracteres (validado en RPC/API) |
| `descripcion` | text | ≤ 300 |
| `precio` | integer NOT NULL CHECK ≥ 0 | COP entero |
| `categoria` | text CHECK in ('almuerzos','desayunos','bebidas','snacks') | |
| `es_almuerzo` | boolean NOT NULL DEFAULT false | solo los almuerzos llevan franja |
| `disponible` | boolean NOT NULL DEFAULT true | **auto-false cuando `stock - stock_reservado = 0`** |
| `stock` | integer NOT NULL DEFAULT 0 CHECK ≥ 0 | stock físico |
| `stock_reservado` | integer NOT NULL DEFAULT 0 CHECK ≥ 0 | retenido por pedidos pendientes |
| `imagen_url` | text | https + bucket permitido |
| `creado_en` / `actualizado_en` | timestamptz | |

**Invariante**: `0 <= stock_reservado <= stock` (CHECK compuesto). Disponible real = `stock - stock_reservado`.

### `estudiantes`
Directorio institucional.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK FK → `auth.users(id)` on delete cascade | |
| `codigo` | text UNIQUE NOT NULL | código de estudiante |
| `nombre_completo` | text NOT NULL | snapshot visible en la bandeja |
| `correo` | text UNIQUE NOT NULL CHECK `like '%@udes.edu.co'` | |
| `rol` | text NOT NULL DEFAULT 'student' CHECK in ('student','admin') | |
| `activo` | boolean NOT NULL DEFAULT true | |

### `slots`
Franjas de recogida por cafetería.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `cafeteria_id` | uuid FK NOT NULL | |
| `hora` | time NOT NULL | 11:30 … 14:00 en pasos de 15 min |
| `cupo_max` | integer NOT NULL DEFAULT 20 CHECK ≥ 0 | |
| `activo` | boolean NOT NULL DEFAULT true | |
| UNIQUE | (`cafeteria_id`, `hora`) | |

### `pedidos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | text UNIQUE NOT NULL | `UD-` + 6 caracteres base32 sin ambigüedad |
| `estudiante_id` | uuid NOT NULL FK → auth.users | |
| `estudiante_codigo` / `estudiante_nombre` | text NOT NULL | snapshot (el directorio puede cambiar) |
| `cafeteria_id` | uuid NOT NULL FK → cafeterias | |
| `estado` | text NOT NULL DEFAULT 'recibido' CHECK in ('recibido','preparando','listo','cancelado','expirado') | |
| `franja_hora` | time NULL | obligatoria si hay almuerzo |
| `total` | integer NOT NULL CHECK ≥ 0 | suma de subtotales (calculada en servidor) |
| `idempotency_key` | text NOT NULL | UNIQUE (`estudiante_id`,`idempotency_key`) |
| `ip_checkout` | inet NULL | recomendación Wompi, capturada en backend |
| `expira_en` | timestamptz NOT NULL | `now() + 15 min` |
| `creado_en` / `actualizado_en` | timestamptz | |

### `pedido_items`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `pedido_id` | uuid NOT NULL FK → pedidos ON DELETE CASCADE | |
| `producto_id` | uuid FK → productos ON DELETE SET NULL | |
| `nombre_producto` | text NOT NULL | snapshot |
| `precio_unitario` | integer NOT NULL CHECK ≥ 0 | snapshot del precio del servidor |
| `cantidad` | integer NOT NULL CHECK 1..20 | |
| `subtotal` | integer NOT NULL CHECK ≥ 0 | = precio_unitario × cantidad |

### `pagos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `pedido_id` | uuid NOT NULL UNIQUE FK → pedidos | 1 pago por pedido |
| `proveedor` | text NOT NULL DEFAULT 'wompi' CHECK in ('wompi','transferencia') | |
| `referencia` | text NOT NULL UNIQUE | = código del pedido (o `TRF-…` para transferencia) |
| `payment_id` | text UNIQUE | id del gateway |
| `estado` | text NOT NULL DEFAULT 'PENDING' CHECK in ('PENDING','APPROVED','DECLINED','VOIDED','ERROR') | |
| `monto` | integer NOT NULL CHECK ≥ 0 | COP |
| `monto_centavos` | integer NOT NULL CHECK ≥ 0 | = monto × 100 |
| `payload` | jsonb | último payload del proveedor (sin PII innecesaria) |

**Transiciones válidas**: `PENDING → APPROVED | DECLINED | VOIDED | ERROR`; `APPROVED → VOIDED` (reverso).

### `notificaciones`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `pedido_id` | uuid NOT NULL FK → pedidos | |
| `canal` | text NOT NULL DEFAULT 'email' | |
| `destinatario` | text NOT NULL | correo institucional |
| `estado` | text NOT NULL DEFAULT 'PENDIENTE' CHECK in ('PENDIENTE','ENVIADO','FALLIDO','AT_CAP') | |
| `intentos` | integer NOT NULL DEFAULT 0 | |
| `provider_id` | text | id de Resend |
| `ultimo_error` | text | mensaje saneado |
| `creado_en` / `enviado_en` | timestamptz | |
| UNIQUE | (`pedido_id`, `canal`) | un aviso por pedido y canal |

### `consentimientos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `estudiante_id` | uuid NOT NULL FK → auth.users | |
| `version_politica` | text NOT NULL | ej. `v1.0` |
| `aceptado` | boolean NOT NULL DEFAULT true | |
| `fecha` | timestamptz NOT NULL DEFAULT now() | prueba |
| `ip` | inet | prueba |
| `user_agent` | text | prueba |

Cada consentimiento (incluido el re-consentimiento) es una **fila nueva**; el historial no se sobrescribe.

### `eventos`
Auditoría y observabilidad durable.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigserial PK | |
| `tipo` | text NOT NULL | `pedido_creado`, `pago_aprobado`, `rol_cambiado`, `stock_ajustado`, … |
| `entidad` | text | `pedido`, `producto`, `estudiante`… |
| `entidad_id` | uuid | |
| `actor_id` | uuid | `auth.uid()` de quien actuó |
| `actor_email` | text | solo admin |
| `payload` | jsonb | sin secretos ni PII innecesaria |
| `creado_en` | timestamptz DEFAULT now() | |

### `keepalive`
Una fila fija. El job diario hace `INSERT … ON CONFLICT DO UPDATE` y **relee** `touched_at`.

### `rate_limit`
Contadores por clave y ventana (`clave` text PK, `ventana` timestamptz, `contador` integer).

## Funciones

| Función | Propósito |
|---|---|
| `set_updated_at()` | trigger genérico de `actualizado_en` |
| `es_admin()` | SECURITY DEFINER: true si `estudiantes.rol='admin'` y `activo` para `auth.uid()` |
| `crear_pedido(items, franja, cafeteria, idempotency)` | transacción atómica: valida, reserva stock, auto-agota, crea pedido + items + evento |
| `marcar_pagado(pedido, referencia)` | consumo de reserva + pago APPROVED (service_role) |
| `avanzar_estado(pedido, estado)` | admin: transiciones válidas + evento + notificación al quedar `listo` |
| `liberar_reservas_vencidas()` | expira pedidos vencidos y devuelve `stock_reservado` |
| `calcular_estimacion_tiempo(cafeteria, franja)` | minutos estimados según carga real |
| `franjas_disponibles(cafeteria)` | hora, cupo total, cupo restante, `bloqueada`, `motivo_bloqueo` |
| `mis_pedidos()` | pedidos del `auth.uid()` con items |
| `cola_admin(cafeteria?)` | cola del admin (nombre + código, sin email) |
| `estadisticas_hoy(cafeteria?)` | pedidos, ingresos APPROVED, pendientes y listos del día en Bogotá |

## Máquina de estados

**Pedido**: `recibido → preparando → listo`; `recibido|preparando → cancelado`; `recibido|preparando → expirado` (solo job). `listo` es terminal.
**Pago**: `PENDING → APPROVED|DECLINED|VOIDED|ERROR`; `APPROVED → VOIDED`.

## RLS (resumen)

| Tabla | Estudiante | Admin |
|---|---|---|
| `cafeterias` | SELECT activas | ALL |
| `productos` | SELECT disponibles de cafeterías activas | ALL |
| `estudiantes` | SELECT/INSERT solo su fila | ALL |
| `slots` | SELECT | ALL |
| `pedidos` | SELECT propios; INSERT/UPDATE solo vía RPC | SELECT todos |
| `pedido_items` | SELECT si el pedido padre es propio | SELECT todos |
| `pagos` | SELECT si el pedido padre es propio | SELECT todos |
| `notificaciones` | — | SELECT todos |
| `consentimientos` | INSERT own + SELECT own | SELECT todos |
| `eventos` | — | SELECT |
| `keepalive` / `rate_limit` | — | solo service_role |

## Índices

`productos(cafeteria_id, categoria)`, `pedidos(estudiante_id, creado_en desc)`, `pedidos(estado, creado_en)`, `pedidos(expira_en) where estado in ('recibido','preparando')`, `pedidos(cafeteria_id, franja_hora, estado)`, `pagos(referencia)`, `pagos(payment_id)`, `notificaciones(pedido_id, canal)`, `slots(cafeteria_id, hora)`, `eventos(creado_en desc)`.
