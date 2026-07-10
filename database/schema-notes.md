# Notas de esquema SQL

Estado: `migrations/0001_init.sql` y `seed.sql` ya aplicados en el proyecto
real de Supabase (verificado: `services` devuelve los 4 registros sembrados
vía anon key; `pets` devuelve vacío sin sesión, confirmando que RLS está
activo). Este documento recoge el modelo lógico definido en la fase de
diseño (Obsidian, `4. Modelos-de-datos/`).

## Cómo aplicar

Gestión manual vía SQL Editor de Supabase, sin CLI ni integración de GitHub
para migraciones (decisión explícita: mantener Sprint 0 simple; se puede
automatizar más adelante en la Fase 10 si hace falta).

1. Pegar y ejecutar `migrations/0001_init.sql`.
2. Pegar y ejecutar `seed.sql`.
3. Crear el primer usuario admin manualmente: registrar un usuario normal
   desde la app (queda como `client` por trigger) y luego, desde el SQL
   Editor, `update public.profiles set role = 'admin' where id = '<uuid>';`
   — no existe (ni debe existir) una vía pública para autoasignarse admin.
4. Pegar y ejecutar `migrations/0002_storage.sql` (Fase 8: bucket `photos`
   y políticas RLS de `storage.objects`).
5. Pegar y ejecutar `migrations/0003_review_pet_photo.sql` (foto de mascota
   en reseñas públicas, con consentimiento).

## Notas de diseño de las políticas RLS

- `is_admin(uid)` es una función `SECURITY DEFINER` que consulta `profiles`
  bypassando su propio RLS, para evitar recursión al comprobar el rol desde
  las políticas de las demás tablas.
- `profiles.role` no puede cambiarlo el propio usuario: un trigger
  (`prevent_role_escalation`) lo impide salvo que quien ejecuta la operación
  ya sea admin. Excepción: se permite cuando `auth.uid()` es `NULL` (SQL
  Editor, `service_role`), necesario para poder crear el primer admin
  manualmente — un usuario autenticado normal nunca tiene `auth.uid()` nulo,
  así que esto no abre una vía de autoescalado. (Bug detectado y corregido
  durante la verificación: la versión inicial bloqueaba también al
  `service_role`, impidiendo crear el primer admin.)
- `bookings`: un cliente solo puede insertar reservas propias, para mascotas
  propias, y siempre en estado `pending` (trigger `enforce_booking_insert_rules`).
  Los cambios de estado posteriores (aceptar/rechazar/completar) son solo
  de administradora.
- `visits` / `visit_photos`: visibles para el cliente únicamente si existe
  un `report` en estado `published` asociado a esa visita y a una mascota
  suya. Sin informe publicado, la visita no es visible para el cliente.
- `reviews`: solo se puede crear una reseña sobre una reserva propia y en
  estado `completed` (trigger `enforce_review_insert_rules`); las reseñas
  publicadas son visibles públicamente (para cualquier usuario, autenticado
  o no).
- `storage.objects` (bucket `photos`, Fase 8): bucket **privado** (no
  público), con convención de rutas `pets/{petId}/...` y
  `visits/{visitId}/...`. Las políticas replican exactamente la misma
  lógica que sus tablas equivalentes: `pets/*` visible/editable por la
  propietaria de la mascota (o admin); `visits/*` visible por el cliente
  solo si existe un informe publicado sobre esa visita para una mascota
  suya, y solo la administradora puede subir/editar/borrar. Como el bucket
  es privado, las imágenes se sirven con URLs firmadas de corta duración
  (`createSignedUrl`/`createSignedUrls`, `src/lib/supabase/storage.ts`),
  nunca con URLs públicas permanentes.

### Hallazgo importante: RLS anidado dentro de políticas de Storage

Durante la verificación se detectó que un `EXISTS` directo contra
`public.pets` (o `public.reports`) **dentro de una política de
`storage.objects`** no ve las filas, aunque el mismo usuario sí las vea
consultando esas tablas normalmente vía REST, y aunque la misma expresión
booleana evaluada "a mano" (simulando el rol y el JWT en el SQL Editor)
da el resultado correcto. Se diagnosticó por descarte, probando la
política real contra la API (no simulaciones): con solo `bucket_id`
funciona; añadiendo la comprobación de carpeta también funciona; en
cuanto se añade el `EXISTS` sobre una tabla con RLS, falla — incluso sin
filtrar por propietario, es decir, la subconsulta no ve ninguna fila en
absoluto en ese contexto.

**Solución** (mismo patrón que `is_admin()`): envolver la comprobación en
una función `SECURITY DEFINER` (`owns_pet`, `can_view_visit_photos`), que
bypassa el RLS de la tabla referenciada de forma controlada. Al usarlas
en vez del `EXISTS` directo, todo funciona correctamente.

**Para recordar en fases futuras**: las políticas de tablas normales
consultadas vía PostgREST (`bookings`, `visits`, `reports`, etc.) sí
pueden usar `EXISTS` directo contra otra tabla con RLS sin problema —
así están escritas desde la Fase 1 y funcionan correctamente. El problema
descrito aquí es **específico de las políticas sobre `storage.objects`**,
evaluadas por el servicio de Storage (separado de PostgREST). Si en el
futuro se añaden más políticas de Storage que dependan de otras tablas,
usar siempre una función `SECURITY DEFINER`, no un `EXISTS` directo.

## Foto de mascota en reseñas públicas (con consentimiento)

`reviews.show_pet_photo` (boolean, default `false`): lo marca el propio
cliente en el formulario de reseña, checkbox visible solo si su mascota
tiene foto principal. Es un consentimiento por reseña, no un ajuste
persistente de la mascota — decisión deliberada para no dar por hecho el
consentimiento en reseñas futuras.

Esto exige exponer datos que antes eran completamente privados
(`pets.main_photo_url`) a un visitante anónimo, así que se añaden dos
piezas nuevas, ambas `SECURITY DEFINER` siguiendo el patrón ya usado por
`owns_pet`/`can_view_visit_photos` (ver hallazgo más abajo):

- `can_view_pet_review_photo(pet_id)`: añadida a la política
  `photos_select` de `storage.objects` para permitir lectura pública de
  `pets/{petId}/...` solo cuando existe una reseña publicada de esa
  mascota con `show_pet_photo = true`.
- `get_published_reviews_public()`: sustituye la consulta directa a
  `reviews` que hacía antes `getPublishedReviews()`. Devuelve exactamente
  los campos seguros para la web pública (`id`, `rating`, `comment`,
  `created_at`, `pet_photo_path`), calculando `pet_photo_path` como
  `null` salvo que `show_pet_photo` sea `true` — así la minimización de
  datos queda garantizada en la propia base de datos, no solo en el
  código de la app.

## Nota sobre `pets.main_photo_url` (Fase 8)

El nombre de la columna sugiere una URL pública, pero al ser el bucket
`photos` privado, en la práctica guarda la **ruta de Storage**
(`pets/{petId}/main-...`), no una URL completa. Se resuelve a una URL
firmada temporal en el momento de mostrarla (`getSignedPhotoUrl`). Se
señala explícitamente aquí porque reinterpreta el propósito original del
campo definido en el modelo de datos, aunque no cambia su tipo (`text`)
ni ninguna relación.

## Tablas previstas

| Tabla | Relación principal |
|---|---|
| `profiles` | `id` = id de Supabase Auth |
| `pets` | `owner_id` → `profiles.id` |
| `services` | — |
| `bookings` | `client_id` → `profiles.id`, `pet_id` → `pets.id`, `service_id` → `services.id` |
| `visits` | `booking_id` → `bookings.id`, `pet_id` → `pets.id`, `created_by` → `profiles.id` |
| `visit_photos` | `visit_id` → `visits.id`, `pet_id` → `pets.id` |
| `reports` | `visit_id` → `visits.id` (1→0..1), `pet_id` → `pets.id` |
| `reviews` | `booking_id` → `bookings.id` (1→0..1), `client_id` → `profiles.id` |

## Estados controlados

- `profiles.role`: `client | admin`
- `bookings.status`: `pending | accepted | rejected | cancelled | completed`
- `reports.status`: `draft | published`
- `reviews.status`: `pending | published | hidden`

Definidos también en código en [`src/lib/constants.ts`](../src/lib/constants.ts).

## Pendiente

- [x] Crear migraciones SQL en `database/migrations/`.
- [x] Activar Row Level Security en todas las tablas con datos privados
      (`profiles`, `pets`, `bookings`, `visits`, `visit_photos`, `reports`, `reviews`),
      y también en `services` (lectura pública de servicios activos).
- [x] Escribir políticas RLS concretas por tabla.
- [x] Seed inicial de `services` (`database/seed.sql`).
- [x] Ejecutar `0001_init.sql` y `seed.sql` en el proyecto real de Supabase.
- [x] Flujo de registro/login implementado y verificado extremo a extremo
      contra el proyecto real (registro → confirmación de email → login →
      redirección por rol → protección de `/admin` → logout).
- [x] Ejecutar `0002_storage.sql` (bucket + políticas de Storage,
      incluyendo las funciones `SECURITY DEFINER` tras el hallazgo
      anterior) en el proyecto real de Supabase.
- [x] Subida de foto principal de mascota y de fotos de visita
      implementadas y verificadas extremo a extremo contra Storage real
      (subida, URL firmada, visualización en detalle/listado de mascota,
      galería en visita admin y en el diario publicado del cliente).
- [x] Ejecutar `0003_review_pet_photo.sql` (foto de mascota en reseñas
      públicas) en el proyecto real de Supabase, y verificado extremo a
      extremo: dejar reseña con el checkbox marcado → publicar como admin
      → foto visible en la landing sin sesión (y ausente en reseñas sin
      consentimiento o de mascotas sin foto principal).

Detalle completo de campos y decisiones: ver Obsidian
`4. Modelos-de-datos/Modelo-logico-de-base-de-datos.md`.
