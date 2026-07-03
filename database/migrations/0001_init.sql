-- Huellario — migración inicial (Fase 1)
-- Aplicar manualmente en el SQL Editor de Supabase.
-- Crea las tablas del MVP, triggers de mantenimiento y políticas RLS.

create extension if not exists pgcrypto;

-- ============================================================
-- Función auxiliar: updated_at automático
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tabla: profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Función auxiliar: comprobar rol admin sin recursión de RLS
-- SECURITY DEFINER: se ejecuta con los privilegios del propietario
-- de la función (bypassa RLS de `profiles` solo dentro de esta función).
-- Debe crearse después de `profiles` (la referencia como LANGUAGE SQL se
-- valida en tiempo de creación, no solo en ejecución).
-- ============================================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- Crea automáticamente el perfil al registrarse en Supabase Auth.
-- El rol siempre nace como 'client': no se puede asignar 'admin' desde el
-- formulario público de registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impide que un cliente se autoasigne el rol admin editando su perfil.
-- auth.uid() es NULL fuera de una petición de usuario autenticado (SQL
-- Editor, service_role): se permite en ese caso para poder crear el primer
-- admin manualmente: un usuario autenticado normal siempre tiene auth.uid()
-- con su propio id, nunca NULL, así que esto no abre una vía de escalado.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin(auth.uid()) then
    raise exception 'Solo una administradora puede cambiar el rol de un perfil';
  end if;
  return new;
end;
$$;

create trigger prevent_profiles_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: services
-- ============================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer,
  price_cents integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

-- Los servicios activos son de consulta pública (se muestran en la landing).
create policy "services_select_active_or_admin" on public.services
  for select using (is_active or public.is_admin(auth.uid()));

create policy "services_write_admin" on public.services
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: pets
-- ============================================================
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  sex text,
  main_photo_url text,
  feeding_routine text,
  medical_info text,
  medication text,
  vet_contact text,
  behavior_notes text,
  energy_level text,
  fears_triggers text,
  special_needs text,
  additional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_pets_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

alter table public.pets enable row level security;

create policy "pets_select_own_or_admin" on public.pets
  for select using (owner_id = auth.uid() or public.is_admin(auth.uid()));

create policy "pets_insert_own" on public.pets
  for insert with check (owner_id = auth.uid());

create policy "pets_update_own_or_admin" on public.pets
  for update using (owner_id = auth.uid() or public.is_admin(auth.uid()));

create policy "pets_delete_own_or_admin" on public.pets
  for delete using (owner_id = auth.uid() or public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: bookings
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  service_id uuid not null references public.services (id),
  requested_date date not null,
  requested_time time not null,
  address text,
  client_notes text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Un cliente solo puede crear reservas propias, para sus propias mascotas,
-- y siempre en estado 'pending' (no puede autoaceptarse ni autocompletarse).
create or replace function public.enforce_booking_insert_rules()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin(auth.uid()) then
    if new.client_id <> auth.uid() then
      raise exception 'No puedes crear una reserva para otro cliente';
    end if;
    if not exists (
      select 1 from public.pets
      where id = new.pet_id and owner_id = auth.uid()
    ) then
      raise exception 'Solo puedes reservar para tus propias mascotas';
    end if;
    if new.status <> 'pending' then
      raise exception 'Una reserva nueva debe crearse en estado pending';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_bookings_insert_rules
  before insert on public.bookings
  for each row execute function public.enforce_booking_insert_rules();

alter table public.bookings enable row level security;

create policy "bookings_select_own_or_admin" on public.bookings
  for select using (client_id = auth.uid() or public.is_admin(auth.uid()));

create policy "bookings_insert_client_or_admin" on public.bookings
  for insert with check (client_id = auth.uid() or public.is_admin(auth.uid()));

-- Cambios de estado (aceptar/rechazar/completar) solo por administradora.
create policy "bookings_update_admin" on public.bookings
  for update using (public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: visits
-- ============================================================
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  visited_at timestamptz not null,
  duration_minutes integer,
  mood text,
  care_checklist jsonb not null default '{}'::jsonb,
  quick_notes text,
  incidents text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_visits_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

-- ============================================================
-- Tabla: reports
-- (se crea aquí, antes de las políticas de visits/visit_photos que la
-- referencian: una política, igual que una función LANGUAGE SQL, valida
-- las tablas referenciadas en tiempo de creación)
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null unique references public.visits (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  generated_text text,
  final_text text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  ai_model text,
  prompt_version text,
  generated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.visits enable row level security;

-- El cliente solo ve la visita si existe un informe ya publicado sobre ella.
create policy "visits_select_admin_or_published_report" on public.visits
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.reports r
      join public.pets p on p.id = r.pet_id
      where r.visit_id = visits.id
        and r.status = 'published'
        and p.owner_id = auth.uid()
    )
  );

create policy "visits_write_admin" on public.visits
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: visit_photos
-- ============================================================
create table public.visit_photos (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  created_at timestamptz not null default now()
);

alter table public.visit_photos enable row level security;

create policy "visit_photos_select_admin_or_published_report" on public.visit_photos
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.reports r
      join public.pets p on p.id = r.pet_id
      where r.visit_id = visit_photos.visit_id
        and r.status = 'published'
        and p.owner_id = auth.uid()
    )
  );

create policy "visit_photos_write_admin" on public.visit_photos
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- Políticas RLS: reports (tabla ya creada más arriba)
-- ============================================================
alter table public.reports enable row level security;

create policy "reports_select_admin_or_published_own" on public.reports
  for select using (
    public.is_admin(auth.uid())
    or (
      status = 'published'
      and exists (
        select 1 from public.pets p
        where p.id = reports.pet_id and p.owner_id = auth.uid()
      )
    )
  );

create policy "reports_write_admin" on public.reports
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- Tabla: reviews
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Solo se puede reseñar una reserva propia y ya completada.
create or replace function public.enforce_review_insert_rules()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin(auth.uid()) then
    if new.client_id <> auth.uid() then
      raise exception 'No puedes crear una reseña para otro cliente';
    end if;
    if not exists (
      select 1 from public.bookings
      where id = new.booking_id and client_id = auth.uid() and status = 'completed'
    ) then
      raise exception 'Solo puedes reseñar tus propias reservas completadas';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_reviews_insert_rules
  before insert on public.reviews
  for each row execute function public.enforce_review_insert_rules();

alter table public.reviews enable row level security;

create policy "reviews_select_own_admin_or_published" on public.reviews
  for select using (
    client_id = auth.uid()
    or public.is_admin(auth.uid())
    or status = 'published'
  );

create policy "reviews_insert_own" on public.reviews
  for insert with check (client_id = auth.uid() or public.is_admin(auth.uid()));

create policy "reviews_update_admin" on public.reviews
  for update using (public.is_admin(auth.uid()));
