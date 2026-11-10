-- ============================================================
-- UDES Food — 0004: lecturas por rol, cupos por franja,
-- estadísticas del día y rate limiting.
-- ============================================================

-- ---------- Mis pedidos ----------
create or replace function public.mis_pedidos()
returns table (
  id uuid,
  codigo text,
  cafeteria_id uuid,
  cafeteria_nombre text,
  estado text,
  franja_hora time,
  total integer,
  creado_en timestamptz,
  items jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.codigo,
    p.cafeteria_id,
    c.nombre,
    p.estado,
    p.franja_hora,
    p.total,
    p.creado_en,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'nombre', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precio_unitario', pi.precio_unitario,
            'subtotal', pi.subtotal
          ) order by pi.nombre_producto
        )
        from public.pedido_items pi
        where pi.pedido_id = p.id
      ),
      '[]'::jsonb
    ) as items
  from public.pedidos p
  join public.cafeterias c on c.id = p.cafeteria_id
  where p.estudiante_id = auth.uid()
  order by p.creado_en desc;
$$;

revoke all on function public.mis_pedidos() from public;
grant execute on function public.mis_pedidos() to authenticated;

-- ---------- Franjas disponibles (cupo + bloqueo por tiempo) ----------
create or replace function public.franjas_disponibles(p_cafeteria_id uuid)
returns table (
  hora time,
  cupo_max integer,
  pedidos_activos integer,
  cupo_restante integer,
  tiempo_estimado_min integer,
  bloqueada boolean,
  motivo_bloqueo text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_caf public.cafeterias%rowtype;
begin
  select * into v_caf from public.cafeterias
  where id = p_cafeteria_id and activo = true;

  if not found then
    return;
  end if;

  return query
  select
    s.hora,
    s.cupo_max,
    coalesce(act.activos, 0)::integer,
    greatest(s.cupo_max - coalesce(act.activos, 0), 0)::integer,
    public.calcular_estimacion_tiempo(p_cafeteria_id, s.hora),
    (
      (s.cupo_max - coalesce(act.activos, 0)) <= 0
      or public.calcular_estimacion_tiempo(p_cafeteria_id, s.hora)
         > floor(extract(epoch from (v_caf.horario_cierre - s.hora)) / 60)::integer
    ),
    case
      when (s.cupo_max - coalesce(act.activos, 0)) <= 0 then 'Sin cupos'
      when public.calcular_estimacion_tiempo(p_cafeteria_id, s.hora)
           > floor(extract(epoch from (v_caf.horario_cierre - s.hora)) / 60)::integer
        then 'No alcanza a prepararse antes del cierre'
      else null
    end
  from public.slots s
  left join lateral (
    select count(*) as activos
    from public.pedidos p
    where p.cafeteria_id = p_cafeteria_id
      and p.franja_hora = s.hora
      and p.estado in ('recibido', 'preparando')
  ) act on true
  where s.cafeteria_id = p_cafeteria_id
    and s.activo = true
  order by s.hora;
end;
$$;

revoke all on function public.franjas_disponibles(uuid) from public;
grant execute on function public.franjas_disponibles(uuid) to authenticated;

-- ---------- Cola del administrador ----------
create or replace function public.cola_admin(p_cafeteria_id uuid default null)
returns table (
  id uuid,
  codigo text,
  estudiante_codigo text,
  estudiante_nombre text,
  cafeteria_id uuid,
  cafeteria_nombre text,
  estado text,
  franja_hora time,
  total integer,
  creado_en timestamptz,
  items jsonb,
  pago_estado text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver la cola' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.codigo,
    p.estudiante_codigo,
    p.estudiante_nombre,
    p.cafeteria_id,
    c.nombre,
    p.estado,
    p.franja_hora,
    p.total,
    p.creado_en,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('nombre', pi.nombre_producto, 'cantidad', pi.cantidad)
          order by pi.nombre_producto
        )
        from public.pedido_items pi
        where pi.pedido_id = p.id
      ),
      '[]'::jsonb
    ) as items,
    coalesce(pg.estado, 'SIN_PAGO') as pago_estado
  from public.pedidos p
  join public.cafeterias c on c.id = p.cafeteria_id
  left join public.pagos pg on pg.pedido_id = p.id
  where (p_cafeteria_id is null or p.cafeteria_id = p_cafeteria_id)
  order by p.creado_en asc;
end;
$$;

revoke all on function public.cola_admin(uuid) from public;
grant execute on function public.cola_admin(uuid) to authenticated;

-- ---------- Estadísticas del día (America/Bogota) ----------
create or replace function public.estadisticas_hoy(p_cafeteria_id uuid default null)
returns table (
  pedidos integer,
  ingresos integer,
  pendientes integer,
  listos integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver las estadísticas' using errcode = '42501';
  end if;

  return query
  select
    count(*)::integer,
    coalesce(sum(case when pg.estado = 'APPROVED' then p.total else 0 end), 0)::integer,
    count(*) filter (where p.estado in ('recibido', 'preparando'))::integer,
    count(*) filter (where p.estado = 'listo')::integer
  from public.pedidos p
  left join public.pagos pg on pg.pedido_id = p.id
  where (p_cafeteria_id is null or p.cafeteria_id = p_cafeteria_id)
    and (p.creado_en at time zone 'America/Bogota')::date
        = (now() at time zone 'America/Bogota')::date;
end;
$$;

revoke all on function public.estadisticas_hoy(uuid) from public;
grant execute on function public.estadisticas_hoy(uuid) to authenticated;

-- ---------- Rate limiting por clave y ventana ----------
create or replace function public.rate_limitar(
  p_clave text,
  p_limite integer,
  p_ventana interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limit (clave, ventana, contador)
  values (p_clave, v_now, 1)
  on conflict (clave) do update
    set contador = case
          when public.rate_limit.ventana < v_now - p_ventana then 1
          else public.rate_limit.contador + 1
        end,
        ventana = case
          when public.rate_limit.ventana < v_now - p_ventana then v_now
          else public.rate_limit.ventana
        end
  returning contador into v_count;

  return v_count <= p_limite;
end;
$$;

revoke all on function public.rate_limitar(text, integer, interval) from public;
grant execute on function public.rate_limitar(text, integer, interval) to authenticated, service_role;
