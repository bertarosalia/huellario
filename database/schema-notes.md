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

Detalle completo de campos y decisiones: ver Obsidian
`4. Modelos-de-datos/Modelo-logico-de-base-de-datos.md`.
