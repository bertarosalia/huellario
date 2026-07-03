# Notas de esquema SQL

Estado: aún no se han creado las tablas en Supabase. Este documento recoge el
modelo lógico definido en la fase de diseño (Obsidian, `4. Modelos-de-datos/`)
como referencia para la futura migración SQL de la Fase 1.

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

- [ ] Crear migraciones SQL en `database/migrations/`.
- [ ] Activar Row Level Security en todas las tablas con datos privados
      (`profiles`, `pets`, `bookings`, `visits`, `visit_photos`, `reports`, `reviews`).
- [ ] Escribir políticas RLS concretas por tabla (ver `docs/arquitectura.md`).
- [ ] Seed inicial de `services` (`database/seed.sql`).

Detalle completo de campos y decisiones: ver Obsidian
`4. Modelos-de-datos/Modelo-logico-de-base-de-datos.md`.
