-- ============================================================
-- UDES Food — 0002: RLS, roles de servidor y auditoría
-- El rol se resuelve con public.es_admin() (lee estudiantes.rol),
-- nunca con el JWT. Sin políticas FOR ALL TO public.
-- ============================================================

alter table public.cafeterias      enable row level security;
alter table public.productos       enable row level security;
alter table public.estudiantes     enable row level security;
alter table public.slots           enable row level security;
alter table public.pedidos         enable row level security;
alter table public.pedido_items    enable row level security;
alter table public.pagos           enable row level security;
alter table public.notificaciones  enable row level security;
alter table public.consentimientos enable row level security;
alter table public.eventos         enable row level security;
alter table public.keepalive       enable row level security;
alter table public.rate_limit      enable row level security;

-- ---------- cafeterias ----------
drop policy if exists cafeterias_select on public.cafeterias;
create policy cafeterias_select on public.cafeterias
  for select to authenticated using (true);

drop policy if exists cafeterias_admin on public.cafeterias;
create policy cafeterias_admin on public.cafeterias
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ---------- productos ----------
drop policy if exists productos_select on public.productos;
create policy productos_select on public.productos
  for select to authenticated using (true);

drop policy if exists productos_admin on public.productos;
create policy productos_admin on public.productos
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ---------- estudiantes ----------
drop policy if exists estudiantes_select on public.estudiantes;
create policy estudiantes_select on public.estudiantes
  for select to authenticated
  using (user_id = auth.uid() or public.es_admin());

drop policy if exists estudiantes_admin_insert on public.estudiantes;
create policy estudiantes_admin_insert on public.estudiantes
  for insert to authenticated with check (public.es_admin());

drop policy if exists estudiantes_admin_update on public.estudiantes;
create policy estudiantes_admin_update on public.estudiantes
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists estudiantes_admin_delete on public.estudiantes;
create policy estudiantes_admin_delete on public.estudiantes
  for delete to authenticated using (public.es_admin());

-- ---------- slots ----------
drop policy if exists slots_select on public.slots;
create policy slots_select on public.slots
  for select to authenticated using (true);

drop policy if exists slots_admin on public.slots;
create policy slots_admin on public.slots
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ---------- pedidos (escritura solo por RPC SECURITY DEFINER) ----------
drop policy if exists pedidos_select on public.pedidos;
create policy pedidos_select on public.pedidos
  for select to authenticated
  using (estudiante_id = auth.uid() or public.es_admin());

-- ---------- pedido_items ----------
drop policy if exists pedido_items_select on public.pedido_items;
create policy pedido_items_select on public.pedido_items
  for select to authenticated
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_items.pedido_id
        and (p.estudiante_id = auth.uid() or public.es_admin())
    )
  );

-- ---------- pagos ----------
drop policy if exists pagos_select on public.pagos;
create policy pagos_select on public.pagos
  for select to authenticated
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = pagos.pedido_id
        and (p.estudiante_id = auth.uid() or public.es_admin())
    )
  );

-- ---------- notificaciones (solo admin) ----------
drop policy if exists notificaciones_admin_select on public.notificaciones;
create policy notificaciones_admin_select on public.notificaciones
  for select to authenticated using (public.es_admin());

-- ---------- consentimientos ----------
drop policy if exists consentimientos_insert_own on public.consentimientos;
create policy consentimientos_insert_own on public.consentimientos
  for insert to authenticated
  with check (estudiante_id = auth.uid() and aceptado = true);

drop policy if exists consentimientos_select on public.consentimientos;
create policy consentimientos_select on public.consentimientos
  for select to authenticated
  using (estudiante_id = auth.uid() or public.es_admin());

-- ---------- eventos (solo admin) ----------
drop policy if exists eventos_admin_select on public.eventos;
create policy eventos_admin_select on public.eventos
  for select to authenticated using (public.es_admin());

-- keepalive y rate_limit: sin políticas (solo service_role / SECURITY DEFINER)

-- ---------- Auditoría de cambios de rol/activo ----------
create or replace function public.auditar_estudiante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and (old.rol is distinct from new.rol or old.activo is distinct from new.activo) then
    insert into public.eventos (tipo, entidad, entidad_id, actor_id, payload)
    values (
      'rol_cambiado',
      'estudiante',
      new.id,
      auth.uid(),
      jsonb_build_object(
        'rol_anterior', old.rol,
        'rol_nuevo', new.rol,
        'activo_anterior', old.activo,
        'activo_nuevo', new.activo
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_estudiantes_audit on public.estudiantes;
create trigger trg_estudiantes_audit
  after update on public.estudiantes
  for each row execute function public.auditar_estudiante();

-- ---------- Grants y revokes (defensa en profundidad) ----------
revoke insert, update, delete on public.pedidos        from anon, authenticated;
revoke insert, update, delete on public.pedido_items   from anon, authenticated;
revoke insert, update, delete on public.pagos          from anon, authenticated;
revoke insert, update, delete on public.notificaciones from anon, authenticated;
revoke insert, update, delete on public.eventos        from anon, authenticated;
revoke all on public.keepalive  from anon, authenticated;
revoke all on public.rate_limit from anon, authenticated;

grant select on public.cafeterias, public.productos, public.slots,
                public.pedidos, public.pedido_items, public.pagos,
                public.consentimientos, public.estudiantes
  to authenticated;

grant insert on public.consentimientos to authenticated;

grant all on public.cafeterias, public.productos, public.estudiantes,
             public.slots, public.pedidos, public.pedido_items, public.pagos,
             public.notificaciones, public.consentimientos, public.eventos,
             public.keepalive, public.rate_limit
  to service_role;
