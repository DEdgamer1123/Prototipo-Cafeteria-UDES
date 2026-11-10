-- ============================================================
-- UDES Food — 0001: esquema base
-- 12 tablas, constraints, índices, triggers y helpers.
-- Dinero en COP entero. Rol resuelto en servidor.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- trigger genérico de actualizado_en ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ---------- Cafeterías (sin seed: las crea el admin) ----------
create table if not exists public.cafeterias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 2 and 80),
  sede text,
  direccion text,
  telefono text,
  vende_almuerzos boolean not null default true,
  activo boolean not null default true,
  horario_apertura time not null default '11:00',
  horario_cierre time not null default '15:00',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------- Productos ----------
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  cafeteria_id uuid references public.cafeterias(id) on delete set null,
  nombre text not null check (char_length(btrim(nombre)) between 3 and 80),
  descripcion text check (descripcion is null or char_length(descripcion) <= 300),
  precio integer not null check (precio >= 0),
  categoria text not null check (categoria in ('almuerzos', 'desayunos', 'bebidas', 'snacks')),
  es_almuerzo boolean not null default false,
  disponible boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  stock_reservado integer not null default 0 check (stock_reservado >= 0),
  imagen_url text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint productos_reserva_valida check (stock_reservado <= stock)
);

-- ---------- Estudiantes (directorio institucional) ----------
-- El directorio se puede pre-registrar ANTES de que exista la cuenta:
-- `user_id` queda null hasta que la persona se registra con su correo.
create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  codigo text not null unique check (char_length(btrim(codigo)) between 3 and 20),
  nombre_completo text not null check (char_length(btrim(nombre_completo)) between 3 and 120),
  correo text not null unique check (lower(correo) like '%@udes.edu.co'),
  rol text not null default 'student' check (rol in ('student', 'admin')),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------- Franjas de recogida por cafetería ----------
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  cafeteria_id uuid not null references public.cafeterias(id) on delete cascade,
  hora time not null,
  cupo_max integer not null default 20 check (cupo_max >= 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  unique (cafeteria_id, hora)
);

-- ---------- Pedidos ----------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  estudiante_id uuid not null references auth.users(id) on delete restrict,
  estudiante_codigo text not null,
  estudiante_nombre text not null,
  cafeteria_id uuid not null references public.cafeterias(id) on delete restrict,
  estado text not null default 'recibido'
    check (estado in ('recibido', 'preparando', 'listo', 'cancelado', 'expirado')),
  franja_hora time,
  total integer not null default 0 check (total >= 0),
  idempotency_key text not null,
  ip_checkout inet,
  expira_en timestamptz not null default (now() + interval '15 minutes'),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (estudiante_id, idempotency_key)
);

-- ---------- Items del pedido (snapshot de nombre y precio) ----------
create table if not exists public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  nombre_producto text not null,
  precio_unitario integer not null check (precio_unitario >= 0),
  cantidad integer not null check (cantidad between 1 and 20),
  subtotal integer not null check (subtotal >= 0),
  creado_en timestamptz not null default now()
);

-- ---------- Pagos ----------
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references public.pedidos(id) on delete cascade,
  proveedor text not null default 'wompi' check (proveedor in ('wompi', 'transferencia')),
  referencia text not null unique,
  payment_id text unique,
  estado text not null default 'PENDING'
    check (estado in ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')),
  monto integer not null check (monto >= 0),
  monto_centavos integer not null check (monto_centavos >= 0),
  payload jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ---------- Notificaciones (email de pedido listo) ----------
create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  canal text not null default 'email' check (canal in ('email')),
  destinatario text not null,
  estado text not null default 'PENDIENTE'
    check (estado in ('PENDIENTE', 'ENVIADO', 'FALLIDO', 'AT_CAP')),
  intentos integer not null default 0 check (intentos >= 0),
  provider_id text,
  ultimo_error text,
  creado_en timestamptz not null default now(),
  enviado_en timestamptz,
  unique (pedido_id, canal)
);

-- ---------- Consentimientos (histórico, nunca se sobrescribe) ----------
create table if not exists public.consentimientos (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  version_politica text not null,
  aceptado boolean not null default true,
  fecha timestamptz not null default now(),
  ip inet,
  user_agent text
);

-- ---------- Auditoría durable ----------
create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null,
  entidad text,
  entidad_id uuid,
  actor_id uuid,
  actor_email text,
  payload jsonb,
  creado_en timestamptz not null default now()
);

-- ---------- Keepalive anti-pausa (write + read-back) ----------
create table if not exists public.keepalive (
  id uuid primary key default gen_random_uuid(),
  touched_at timestamptz not null default now()
);

-- ---------- Rate limiting ----------
create table if not exists public.rate_limit (
  clave text primary key,
  ventana timestamptz not null,
  contador integer not null default 0 check (contador >= 0)
);

-- ---------- Índices ----------
create index if not exists productos_cafeteria_categoria_idx on public.productos (cafeteria_id, categoria);
create index if not exists productos_disponibles_idx on public.productos (disponible) where disponible;
create index if not exists estudiantes_correo_idx on public.estudiantes (lower(correo));
create index if not exists pedidos_estudiante_idx on public.pedidos (estudiante_id, creado_en desc);
create index if not exists pedidos_estado_creado_idx on public.pedidos (estado, creado_en desc);
create index if not exists pedidos_expira_idx on public.pedidos (expira_en)
  where estado in ('recibido', 'preparando');
create index if not exists pedidos_cafeteria_franja_idx on public.pedidos (cafeteria_id, franja_hora, estado);
create index if not exists pedido_items_pedido_idx on public.pedido_items (pedido_id);
create index if not exists pagos_pedido_idx on public.pagos (pedido_id);
create index if not exists notificaciones_estado_idx on public.notificaciones (estado, creado_en);
create index if not exists consentimientos_estudiante_idx on public.consentimientos (estudiante_id, fecha desc);
create index if not exists eventos_creado_idx on public.eventos (creado_en desc);
create index if not exists eventos_entidad_idx on public.eventos (entidad, entidad_id);

-- ---------- Triggers de actualizado_en ----------
drop trigger if exists trg_cafeterias_updated on public.cafeterias;
create trigger trg_cafeterias_updated before update on public.cafeterias
  for each row execute function public.set_updated_at();

drop trigger if exists trg_productos_updated on public.productos;
create trigger trg_productos_updated before update on public.productos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_estudiantes_updated on public.estudiantes;
create trigger trg_estudiantes_updated before update on public.estudiantes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_pedidos_updated on public.pedidos;
create trigger trg_pedidos_updated before update on public.pedidos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_pagos_updated on public.pagos;
create trigger trg_pagos_updated before update on public.pagos
  for each row execute function public.set_updated_at();

-- ---------- es_admin(): única fuente de rol ----------
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.estudiantes e
    where e.user_id = auth.uid()
      and e.rol = 'admin'
      and e.activo = true
  );
$$;

revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to authenticated, service_role;

-- ---------- Vista del catálogo visible ----------
create or replace view public.productos_publicos
with (security_invoker = true) as
select
  p.id,
  p.cafeteria_id,
  p.nombre,
  p.descripcion,
  p.precio,
  p.categoria,
  p.es_almuerzo,
  p.disponible,
  p.stock,
  p.stock_reservado,
  p.imagen_url
from public.productos p
left join public.cafeterias c on c.id = p.cafeteria_id
where p.disponible
  and (p.cafeteria_id is null or c.activo = true);

-- ---------- Helper: crear las 11 franjas de una cafetería ----------
create or replace function public.crear_slots_por_defecto(
  p_cafeteria_id uuid,
  p_cupo integer default 20
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
  v_hora time;
  v_creados integer := 0;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede crear franjas' using errcode = '42501';
  end if;

  for i in 0..10 loop
    v_hora := time '11:30' + (i * interval '15 minutes');
    insert into public.slots (cafeteria_id, hora, cupo_max, activo)
    values (p_cafeteria_id, v_hora, p_cupo, true)
    on conflict (cafeteria_id, hora) do nothing;
    v_creados := v_creados + 1;
  end loop;

  return v_creados;
end;
$$;

revoke all on function public.crear_slots_por_defecto(uuid, integer) from public;
grant execute on function public.crear_slots_por_defecto(uuid, integer) to authenticated;
