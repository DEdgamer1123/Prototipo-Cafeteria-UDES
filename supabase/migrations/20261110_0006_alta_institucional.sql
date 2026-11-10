-- ============================================================
-- UDES Food — 0006: alta institucional
-- Solo se permite registrarse con un correo @udes.edu.co que ya
-- exista en el directorio `estudiantes` (pre-registrado por el admin).
-- El alta vincula `estudiantes.user_id` con la cuenta nueva.
-- ============================================================

create or replace function public.validar_alta_institucional()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_est public.estudiantes%rowtype;
begin
  if lower(new.email) not like '%@udes.edu.co' then
    raise exception 'Solo se permite el correo institucional @udes.edu.co' using errcode = '42501';
  end if;

  select * into v_est
  from public.estudiantes
  where lower(correo) = lower(new.email);

  if not found then
    raise exception 'Tu correo no está registrado en el directorio. Pide a la cafetería que te dé de alta.'
      using errcode = '42501';
  end if;

  if not v_est.activo then
    raise exception 'Tu cuenta está inactiva. Contacta a la cafetería.' using errcode = '42501';
  end if;

  if v_est.user_id is not null and v_est.user_id <> new.id then
    raise exception 'Ese correo ya tiene una cuenta registrada' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auth_users_institucional on auth.users;
create trigger trg_auth_users_institucional
  before insert on auth.users
  for each row execute function public.validar_alta_institucional();

create or replace function public.vincular_estudiante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.estudiantes
    set user_id = new.id
    where lower(correo) = lower(new.email)
      and user_id is null;

  insert into public.eventos (tipo, entidad, entidad_id, actor_id, payload)
  values ('alta_estudiante', 'estudiante', new.id, new.id,
          jsonb_build_object('correo', new.email));

  return new;
end;
$$;

drop trigger if exists trg_auth_users_vincular on auth.users;
create trigger trg_auth_users_vincular
  after insert on auth.users
  for each row execute function public.vincular_estudiante();
