-- ============================================================
-- UDES Food — 0005: jobs de operación (pg_cron)
-- Keepalive anti-pausa (write + read-back) y expiración de reservas.
-- ============================================================

create extension if not exists pg_cron;

-- Fila fija del keepalive (una sola)
insert into public.keepalive (id, touched_at)
values ('00000000-0000-4000-8000-00000000beef', now())
on conflict (id) do nothing;

-- Keepalive diario a las 03:00 UTC (fuera de la ventana del cron de Vercel, 03:10)
do $$
begin
  perform cron.unschedule('udes-food-keepalive');
exception when others then null;
end $$;

select cron.schedule(
  'udes-food-keepalive',
  '0 3 * * *',
  $job$
    insert into public.keepalive (id, touched_at)
    values ('00000000-0000-4000-8000-00000000beef', now())
    on conflict (id) do update set touched_at = excluded.touched_at;
  $job$
);

-- Expiración de reservas cada 5 minutos
do $$
begin
  perform cron.unschedule('udes-food-expirar-reservas');
exception when others then null;
end $$;

select cron.schedule(
  'udes-food-expirar-reservas',
  '*/5 * * * *',
  $job$
    select public.liberar_reservas_vencidas();
  $job$
);
