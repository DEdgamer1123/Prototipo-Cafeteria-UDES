-- ============================================================
-- UDES Food — 0003: RPCs del dominio de pedidos
-- Reserva de stock atómica, auto-agotado, idempotencia,
-- máquina de estados, consumo y liberación de reservas.
-- ============================================================

-- ---------- Código de pedido: UD- + 6 chars base32 sin ambigüedad ----------
create or replace function public.generar_codigo_pedido()
returns text
language plpgsql
volatile
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin I, O, 0, 1
  v_bytes bytea := gen_random_bytes(6);
  v_out text := '';
  i integer;
begin
  for i in 0..5 loop
    v_out := v_out || substr(v_alfabeto, (get_byte(v_bytes, i) % 32) + 1, 1);
  end loop;
  return 'UD-' || v_out;
end;
$$;

-- ---------- Estimación de tiempo (minutos de carga de la franja) ----------
create or replace function public.calcular_estimacion_tiempo(
  p_cafeteria_id uuid,
  p_franja_hora time
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(
    (case when pr.es_almuerzo then 8 else 5 end) * pi.cantidad
  ), 0)::integer
  from public.pedidos p
  join public.pedido_items pi on pi.pedido_id = p.id
  join public.productos pr on pr.id = pi.producto_id
  where p.cafeteria_id = p_cafeteria_id
    and p.franja_hora = p_franja_hora
    and p.estado in ('recibido', 'preparando');
$$;

-- ---------- Crear pedido (transaccional) ----------
create or replace function public.crear_pedido(
  p_items jsonb,
  p_franja_hora time,
  p_cafeteria_id uuid,
  p_idempotency_key text
)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_est public.estudiantes%rowtype;
  v_caf public.cafeterias%rowtype;
  v_prod public.productos%rowtype;
  v_pedido public.pedidos%rowtype;
  v_existente public.pedidos%rowtype;
  v_item jsonb;
  v_prod_id uuid;
  v_cantidad integer;
  v_total integer := 0;
  v_minutos integer := 0;
  v_algun_almuerzo boolean := false;
  v_codigo text;
  v_intento integer;
  v_cupo integer;
  v_activos integer;
  v_capacidad integer;
  v_carga integer;
  v_stock integer;
  v_reservado integer;
  v_dup integer;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using errcode = '42501';
  end if;

  if p_idempotency_key is null
     or char_length(btrim(p_idempotency_key)) < 8
     or char_length(p_idempotency_key) > 64 then
    raise exception 'idempotency_key inválida' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene items' using errcode = '22023';
  end if;

  if jsonb_array_length(p_items) > 20 then
    raise exception 'Demasiados items en el pedido' using errcode = '22023';
  end if;

  -- Idempotencia: mismo usuario + misma clave => mismo pedido
  select * into v_existente
  from public.pedidos
  where estudiante_id = v_uid and idempotency_key = p_idempotency_key;

  if found then
    return v_existente;
  end if;

  select * into v_est from public.estudiantes where user_id = v_uid and activo = true;
  if not found then
    raise exception 'Tu código de estudiante no está registrado o está inactivo' using errcode = '42501';
  end if;

  select * into v_caf from public.cafeterias where id = p_cafeteria_id;
  if not found or not v_caf.activo then
    raise exception 'Cafetería no disponible' using errcode = '22023';
  end if;

  -- Sin productos duplicados en el payload
  select count(*) into v_dup
  from (select distinct value->>'producto_id' from jsonb_array_elements(p_items)) d;
  if v_dup <> jsonb_array_length(p_items) then
    raise exception 'Hay productos duplicados en el pedido' using errcode = '22023';
  end if;

  -- Bloquea los productos en orden determinista (evita deadlocks)
  perform 1
  from public.productos p
  where p.id in (
    select (value->>'producto_id')::uuid from jsonb_array_elements(p_items)
  )
  order by p.id
  for update;

  for v_item in select value from jsonb_array_elements(p_items) loop
    begin
      v_prod_id := (v_item->>'producto_id')::uuid;
      v_cantidad := (v_item->>'cantidad')::integer;
    exception when others then
      raise exception 'Item inválido' using errcode = '22023';
    end;

    if v_cantidad is null or v_cantidad < 1 or v_cantidad > 20 then
      raise exception 'Cantidad inválida (1 a 20)' using errcode = '22023';
    end if;

    select * into v_prod from public.productos where id = v_prod_id;
    if not found then
      raise exception 'Producto no encontrado' using errcode = '22023';
    end if;

    if v_prod.cafeteria_id is not null and v_prod.cafeteria_id <> p_cafeteria_id then
      raise exception 'El producto % no pertenece a esa cafetería', v_prod.nombre using errcode = '22023';
    end if;

    if not v_prod.disponible then
      raise exception 'El producto % está agotado', v_prod.nombre using errcode = 'P0001';
    end if;

    if (v_prod.stock - v_prod.stock_reservado) < v_cantidad then
      raise exception 'Stock insuficiente para % (quedan %)',
        v_prod.nombre, (v_prod.stock - v_prod.stock_reservado)
        using errcode = 'P0001';
    end if;

    if v_prod.es_almuerzo then
      v_algun_almuerzo := true;
      v_minutos := v_minutos + (8 * v_cantidad);
    else
      v_minutos := v_minutos + (5 * v_cantidad);
    end if;

    v_total := v_total + (v_prod.precio * v_cantidad);
  end loop;

  if v_algun_almuerzo and not v_caf.vende_almuerzos then
    raise exception 'Esta cafetería no vende almuerzos' using errcode = 'P0001';
  end if;

  if v_algun_almuerzo and p_franja_hora is null then
    raise exception 'Selecciona una hora de recogida para el almuerzo' using errcode = '22023';
  end if;

  if p_franja_hora is not null then
    select s.cupo_max into v_cupo
    from public.slots s
    where s.cafeteria_id = p_cafeteria_id and s.hora = p_franja_hora and s.activo;

    if not found then
      raise exception 'Franja no disponible' using errcode = '22023';
    end if;

    select count(*) into v_activos
    from public.pedidos
    where cafeteria_id = p_cafeteria_id
      and franja_hora = p_franja_hora
      and estado in ('recibido', 'preparando');

    if v_activos >= v_cupo then
      raise exception 'Sin cupos para esa franja' using errcode = 'P0001';
    end if;

    -- Capacidad: la cola + este pedido deben caber antes del cierre
    v_capacidad := floor(extract(epoch from (v_caf.horario_cierre - p_franja_hora)) / 60)::integer;
    v_carga := public.calcular_estimacion_tiempo(p_cafeteria_id, p_franja_hora) + v_minutos;

    if v_carga > v_capacidad then
      raise exception 'Esa franja ya no alcanza a prepararse antes del cierre' using errcode = 'P0001';
    end if;
  end if;

  -- Inserta el pedido con reintento de código único
  for v_intento in 1..5 loop
    v_codigo := public.generar_codigo_pedido();
    begin
      insert into public.pedidos (
        codigo, estudiante_id, estudiante_codigo, estudiante_nombre,
        cafeteria_id, estado, franja_hora, total, idempotency_key, expira_en
      ) values (
        v_codigo, v_uid, v_est.codigo, v_est.nombre_completo,
        p_cafeteria_id, 'recibido', p_franja_hora, v_total, p_idempotency_key,
        now() + interval '15 minutes'
      )
      returning * into v_pedido;
      exit;
    exception when unique_violation then
      -- Carrera con la misma idempotency_key: devuelve el pedido ya creado
      select * into v_existente
      from public.pedidos
      where estudiante_id = v_uid and idempotency_key = p_idempotency_key;
      if found then
        return v_existente;
      end if;
      if v_intento = 5 then
        raise;
      end if;
    end;
  end loop;

  -- Items + reserva de stock + auto-agotado
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'producto_id')::uuid;
    v_cantidad := (v_item->>'cantidad')::integer;

    select * into v_prod from public.productos where id = v_prod_id;

    insert into public.pedido_items (
      pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal
    ) values (
      v_pedido.id, v_prod.id, v_prod.nombre, v_prod.precio, v_cantidad, v_prod.precio * v_cantidad
    );

    update public.productos
      set stock_reservado = stock_reservado + v_cantidad
      where id = v_prod_id
      returning stock, stock_reservado into v_stock, v_reservado;

    if (v_stock - v_reservado) = 0 then
      update public.productos set disponible = false where id = v_prod_id;
      insert into public.eventos (tipo, entidad, entidad_id, actor_id, payload)
      values ('stock_agotado', 'producto', v_prod_id, v_uid,
              jsonb_build_object('nombre', v_prod.nombre, 'stock', v_stock));
    end if;
  end loop;

  insert into public.eventos (tipo, entidad, entidad_id, actor_id, payload)
  values ('pedido_creado', 'pedido', v_pedido.id, v_uid,
          jsonb_build_object('codigo', v_pedido.codigo, 'cafeteria_id', p_cafeteria_id, 'total', v_total));

  return v_pedido;
end;
$$;

revoke all on function public.crear_pedido(jsonb, time, uuid, text) from public;
grant execute on function public.crear_pedido(jsonb, time, uuid, text) to authenticated;

-- ---------- Marcar pagado (consumo de reserva; solo service_role) ----------
create or replace function public.marcar_pagado(
  p_pedido_id uuid,
  p_referencia text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido public.pedidos%rowtype;
  v_pago public.pagos%rowtype;
  v_item public.pedido_items%rowtype;
begin
  select * into v_pedido from public.pedidos where id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido no encontrado' using errcode = 'P0002';
  end if;

  select * into v_pago from public.pagos where pedido_id = p_pedido_id for update;
  if not found then
    raise exception 'Pago no encontrado' using errcode = 'P0002';
  end if;
  if v_pago.referencia <> p_referencia then
    raise exception 'Referencia no coincide' using errcode = 'P0001';
  end if;
  if v_pago.estado = 'APPROVED' then
    return; -- replay: no-op idempotente
  end if;
  if v_pago.estado in ('DECLINED', 'ERROR', 'VOIDED') then
    raise exception 'El pago está en estado % y no puede aprobarse', v_pago.estado using errcode = 'P0001';
  end if;

  update public.pagos set estado = 'APPROVED' where id = v_pago.id;

  for v_item in select * from public.pedido_items where pedido_id = p_pedido_id loop
    if v_item.producto_id is not null then
      update public.productos
        set stock = stock - v_item.cantidad,
            stock_reservado = stock_reservado - v_item.cantidad
        where id = v_item.producto_id;
    end if;
  end loop;

  insert into public.eventos (tipo, entidad, entidad_id, payload)
  values ('pago_aprobado', 'pedido', p_pedido_id,
          jsonb_build_object('referencia', p_referencia, 'monto_centavos', v_pago.monto_centavos));
end;
$$;

revoke all on function public.marcar_pagado(uuid, text) from public;
grant execute on function public.marcar_pagado(uuid, text) to service_role;

-- ---------- Avanzar estado (solo admin) ----------
create or replace function public.avanzar_estado(
  p_pedido_id uuid,
  p_estado text
)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido public.pedidos%rowtype;
  v_item public.pedido_items%rowtype;
  v_pago public.pagos%rowtype;
  v_valida boolean := false;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar el estado' using errcode = '42501';
  end if;

  select * into v_pedido from public.pedidos where id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido no encontrado' using errcode = 'P0002';
  end if;

  v_valida := case
    when v_pedido.estado = 'recibido' and p_estado in ('preparando', 'cancelado', 'expirado') then true
    when v_pedido.estado = 'preparando' and p_estado in ('listo', 'cancelado', 'expirado') then true
    else false
  end;

  if not v_valida then
    raise exception 'Transición no permitida: % a %', v_pedido.estado, p_estado using errcode = 'P0001';
  end if;

  update public.pedidos set estado = p_estado where id = p_pedido_id returning * into v_pedido;

  -- Liberar reserva al cancelar/expirar si el pago no está aprobado
  if p_estado in ('cancelado', 'expirado') then
    select * into v_pago from public.pagos where pedido_id = p_pedido_id;
    if not found or v_pago.estado <> 'APPROVED' then
      for v_item in select * from public.pedido_items where pedido_id = p_pedido_id loop
        if v_item.producto_id is not null then
          update public.productos
            set stock_reservado = stock_reservado - v_item.cantidad,
                disponible = case
                  when (stock - (stock_reservado - v_item.cantidad)) > 0 then true
                  else disponible
                end
            where id = v_item.producto_id;
        end if;
      end loop;
    end if;
  end if;

  -- Notificación pendiente al quedar listo
  if p_estado = 'listo' then
    insert into public.notificaciones (pedido_id, canal, destinatario, estado)
    select v_pedido.id, 'email', e.correo, 'PENDIENTE'
    from public.estudiantes e
    where e.user_id = v_pedido.estudiante_id
    on conflict (pedido_id, canal) do nothing;
  end if;

  insert into public.eventos (tipo, entidad, entidad_id, actor_id, payload)
  values ('estado_cambiado', 'pedido', v_pedido.id, auth.uid(),
          jsonb_build_object('estado', p_estado));

  return v_pedido;
end;
$$;

revoke all on function public.avanzar_estado(uuid, text) from public;
grant execute on function public.avanzar_estado(uuid, text) to authenticated;

-- ---------- Liberar reservas vencidas (cron) ----------
create or replace function public.liberar_reservas_vencidas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido record;
  v_item record;
  v_count integer := 0;
begin
  for v_pedido in
    select id from public.pedidos
    where estado in ('recibido', 'preparando')
      and expira_en < now()
    for update skip locked
  loop
    for v_item in select * from public.pedido_items where pedido_id = v_pedido.id loop
      if v_item.producto_id is not null then
        update public.productos
          set stock_reservado = stock_reservado - v_item.cantidad,
              disponible = case
                when (stock - (stock_reservado - v_item.cantidad)) > 0 then true
                else disponible
              end
          where id = v_item.producto_id;
      end if;
    end loop;

    update public.pedidos set estado = 'expirado' where id = v_pedido.id;

    insert into public.eventos (tipo, entidad, entidad_id, payload)
    values ('pedido_expirado', 'pedido', v_pedido.id, jsonb_build_object('motivo', 'ttl'));

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.liberar_reservas_vencidas() from public;
grant execute on function public.liberar_reservas_vencidas() to service_role;
