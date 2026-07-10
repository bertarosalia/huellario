-- Huellario — permite mostrar la foto de la mascota en una reseña pública,
-- solo si el dueño da su consentimiento explícito al dejar la reseña.
-- Aplicar manualmente en el SQL Editor de Supabase (después de 0002_storage.sql).

alter table public.reviews
  add column show_pet_photo boolean not null default false;

-- Función auxiliar SECURITY DEFINER (mismo patrón que owns_pet /
-- can_view_visit_photos, ver 0002_storage.sql): permite lectura pública
-- en storage.objects de la foto principal de una mascota únicamente
-- cuando existe una reseña publicada de esa mascota con consentimiento
-- explícito (show_pet_photo = true).
create or replace function public.can_view_pet_review_photo(target_pet_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.reviews rv
    join public.bookings b on b.id = rv.booking_id
    where b.pet_id::text = target_pet_id
      and rv.status = 'published'
      and rv.show_pet_photo = true
  );
$$;

drop policy if exists "photos_select" on storage.objects;
create policy "photos_select" on storage.objects
  for select using (
    bucket_id = 'photos' and (
      public.is_admin(auth.uid())
      or (
        (storage.foldername(name))[1] = 'pets'
        and (
          public.owns_pet(auth.uid(), (storage.foldername(name))[2])
          or public.can_view_pet_review_photo((storage.foldername(name))[2])
        )
      )
      or (
        (storage.foldername(name))[1] = 'visits'
        and public.can_view_visit_photos(auth.uid(), (storage.foldername(name))[2])
      )
    )
  );

-- Función SECURITY DEFINER que expone exactamente los campos seguros para
-- la vista pública de reseñas (nunca datos de cliente ni de mascota más
-- allá de la foto consentida): bypassa el RLS de bookings/pets de forma
-- controlada, igual que get_published_reviews_public es la única vía para
-- que un visitante anónimo llegue a esos datos.
create or replace function public.get_published_reviews_public()
returns table (
  id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  pet_photo_path text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    rv.id,
    rv.rating,
    rv.comment,
    rv.created_at,
    case when rv.show_pet_photo then p.main_photo_url else null end as pet_photo_path
  from public.reviews rv
  join public.bookings b on b.id = rv.booking_id
  join public.pets p on p.id = b.pet_id
  where rv.status = 'published'
  order by rv.created_at desc;
$$;
