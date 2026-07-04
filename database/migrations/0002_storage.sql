-- Huellario — Fase 8: Storage para fotografías
-- Aplicar manualmente en el SQL Editor de Supabase (después de 0001_init.sql).

-- Bucket privado único, con convención de rutas por tipo:
--   pets/{petId}/{filename}    → foto principal de mascota
--   visits/{visitId}/{filename} → fotos de una visita
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- ============================================================
-- Funciones auxiliares SECURITY DEFINER
--
-- IMPORTANTE: un EXISTS directo contra `public.pets` (o `public.reports`)
-- dentro de una política de storage.objects NO ve las filas, aunque el
-- mismo usuario sí las vea consultando esas tablas normalmente vía REST.
-- Esto se debe a cómo el servicio de Storage evalúa el RLS anidado de
-- otra tabla dentro de su propio chequeo — comprobado empíricamente
-- durante la Fase 8. La solución (el mismo patrón que ya usa is_admin())
-- es envolver la comprobación en una función SECURITY DEFINER, que
-- bypassa el RLS de la tabla referenciada de forma controlada.
-- ============================================================

create or replace function public.owns_pet(uid uuid, target_pet_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.pets
    where id::text = target_pet_id and owner_id = uid
  );
$$;

create or replace function public.can_view_visit_photos(uid uuid, target_visit_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.reports r
    join public.pets p on p.id = r.pet_id
    where r.visit_id::text = target_visit_id
      and r.status = 'published'
      and p.owner_id = uid
  );
$$;

-- ============================================================
-- Políticas RLS sobre storage.objects para el bucket 'photos'
-- ============================================================

drop policy if exists "photos_select" on storage.objects;
drop policy if exists "photos_insert" on storage.objects;
drop policy if exists "photos_update" on storage.objects;
drop policy if exists "photos_delete" on storage.objects;

create policy "photos_select" on storage.objects
  for select using (
    bucket_id = 'photos' and (
      public.is_admin(auth.uid())
      or (
        (storage.foldername(name))[1] = 'pets'
        and public.owns_pet(auth.uid(), (storage.foldername(name))[2])
      )
      or (
        (storage.foldername(name))[1] = 'visits'
        and public.can_view_visit_photos(auth.uid(), (storage.foldername(name))[2])
      )
    )
  );

-- Solo la propietaria de la mascota (o admin) sube/edita/borra fotos de mascota.
-- Las fotos de visita solo las gestiona la administradora.
create policy "photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'photos' and (
      public.is_admin(auth.uid())
      or (
        (storage.foldername(name))[1] = 'pets'
        and public.owns_pet(auth.uid(), (storage.foldername(name))[2])
      )
    )
  );

create policy "photos_update" on storage.objects
  for update using (
    bucket_id = 'photos' and (
      public.is_admin(auth.uid())
      or (
        (storage.foldername(name))[1] = 'pets'
        and public.owns_pet(auth.uid(), (storage.foldername(name))[2])
      )
    )
  );

create policy "photos_delete" on storage.objects
  for delete using (
    bucket_id = 'photos' and (
      public.is_admin(auth.uid())
      or (
        (storage.foldername(name))[1] = 'pets'
        and public.owns_pet(auth.uid(), (storage.foldername(name))[2])
      )
    )
  );
