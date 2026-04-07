-- =========================================================
-- CONVIVE MVP - SUPABASE SQL
-- Tablas, triggers, funciones, RLS y policies
-- =========================================================


-- =========================================================
-- 1) TABLAS
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  join_code text not null unique,
  public_code text unique,
  max_members int not null check (max_members > 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.house_members (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (house_id, profile_id)
);

create table if not exists public.house_invites (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  code text not null unique,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);


-- =========================================================
-- 2) UPDATED_AT
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_houses_updated_at on public.houses;
create trigger set_houses_updated_at
before update on public.houses
for each row execute function public.set_updated_at();

drop trigger if exists set_house_members_updated_at on public.house_members;
create trigger set_house_members_updated_at
before update on public.house_members
for each row execute function public.set_updated_at();


-- =========================================================
-- 3) CREAR PROFILE AUTOMÁTICAMENTE AL REGISTRARSE
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- =========================================================
-- 4) RELLENAR PROFILES YA EXISTENTES
-- =========================================================

insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
on conflict (id) do update
set email = excluded.email;


-- =========================================================
-- 5) GENERADOR DE CÓDIGO PÚBLICO
-- =========================================================

create or replace function public.generate_house_code(code_length int default 12)
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int;
begin
  for i in 1..code_length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;

  return result;
end;
$$;


-- =========================================================
-- 6) CREAR PISO
-- Devuelve public_code
-- =========================================================

drop function if exists public.create_house(text, integer);

create function public.create_house(
  p_name text,
  p_max_members int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_house_id uuid;
  v_join_code text;
  v_public_code text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'El nombre del piso es obligatorio';
  end if;

  if p_max_members is null or p_max_members < 1 then
    raise exception 'El número de personas debe ser mayor que 0';
  end if;

  v_join_code := lpad(floor(random() * 1000000)::text, 6, '0');

  while exists (
    select 1 from public.houses where join_code = v_join_code
  ) loop
    v_join_code := lpad(floor(random() * 1000000)::text, 6, '0');
  end loop;

  v_public_code := public.generate_house_code(12);

  while exists (
    select 1 from public.houses where public_code = v_public_code
  ) loop
    v_public_code := public.generate_house_code(12);
  end loop;

  insert into public.houses (name, created_by, join_code, public_code, max_members)
  values (trim(p_name), auth.uid(), v_join_code, v_public_code, p_max_members)
  returning id into v_house_id;

  insert into public.house_members (house_id, profile_id, role)
  values (v_house_id, auth.uid(), 'admin');

  insert into public.house_invites (house_id, created_by, code, max_uses)
  values (v_house_id, auth.uid(), v_join_code, p_max_members - 1);

  return v_public_code;
end;
$$;


-- =========================================================
-- 7) UNIRSE A PISO
-- Usa public_code y devuelve public_code
-- =========================================================

drop function if exists public.join_house_by_code(text);

create function public.join_house_by_code(
  p_code text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_house public.houses%rowtype;
  v_current_members int;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select *
  into v_house
  from public.houses
  where public_code = trim(p_code)
    and status = 'active'
  limit 1;

  if v_house.id is null then
    raise exception 'Código no válido';
  end if;

  if exists (
    select 1
    from public.house_members
    where house_id = v_house.id
      and profile_id = auth.uid()
      and is_active = true
  ) then
    return v_house.public_code;
  end if;

  select count(*)
  into v_current_members
  from public.house_members
  where house_id = v_house.id
    and is_active = true;

  if v_current_members >= v_house.max_members then
    raise exception 'El piso ya está completo';
  end if;

  insert into public.house_members (house_id, profile_id, role)
  values (v_house.id, auth.uid(), 'member');

  return v_house.public_code;
end;
$$;


-- =========================================================
-- 8) OBTENER MI PISO ACTIVO
-- =========================================================

create or replace function public.get_my_active_house()
returns table (
  house_id uuid,
  house_name text,
  role text,
  join_code text,
  public_code text,
  max_members int
)
language sql
security definer
set search_path = public
as $$
  select
    h.id as house_id,
    h.name as house_name,
    hm.role,
    h.join_code,
    h.public_code,
    h.max_members
  from public.house_members hm
  join public.houses h on h.id = hm.house_id
  where hm.profile_id = auth.uid()
    and hm.is_active = true
    and h.status = 'active'
  order by hm.joined_at asc
  limit 1;
$$;


-- =========================================================
-- 9) FUNCIONES HELPER PARA RLS
-- =========================================================

create or replace function public.is_house_member(p_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.house_members hm
    where hm.house_id = p_house_id
      and hm.profile_id = auth.uid()
      and hm.is_active = true
  );
$$;

create or replace function public.is_house_creator(p_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.houses h
    where h.id = p_house_id
      and h.created_by = auth.uid()
  );
$$;


-- =========================================================
-- 10) PERMISOS PARA RPC / FUNCIONES
-- =========================================================

grant execute on function public.create_house(text, int) to authenticated;
grant execute on function public.join_house_by_code(text) to authenticated;
grant execute on function public.get_my_active_house() to authenticated;
grant execute on function public.is_house_member(uuid) to authenticated;
grant execute on function public.is_house_creator(uuid) to authenticated;


-- =========================================================
-- 11) ACTIVAR RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.houses enable row level security;
alter table public.house_members enable row level security;
alter table public.house_invites enable row level security;


-- =========================================================
-- 12) POLICIES RLS
-- =========================================================

drop policy if exists "houses_select_if_member" on public.houses;
create policy "houses_select_if_member"
on public.houses
for select
to authenticated
using (
  created_by = auth.uid()
  or public.is_house_member(id)
);

drop policy if exists "house_members_select_if_member" on public.house_members;
create policy "house_members_select_if_member"
on public.house_members
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_house_member(house_id)
  or public.is_house_creator(house_id)
);

drop policy if exists "profiles_select_same_house" on public.profiles;
drop policy if exists "profile_select_own" on public.profiles;
create policy "profiles_select_same_house"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.house_members hm
    where hm.profile_id = profiles.id
      and hm.is_active = true
      and public.is_house_member(hm.house_id)
  )
);

drop policy if exists "invites_select_if_member" on public.house_invites;
create policy "invites_select_if_member"
on public.house_invites
for select
to authenticated
using (
  public.is_house_member(house_id)
  or public.is_house_creator(house_id)
);