# Huellario

Plataforma web de gestión de servicios de pet sitting a domicilio, con
generación automática de diarios de visita mediante IA. TFM individual.

## Stack técnico

Next.js (App Router) · TypeScript · React · Tailwind CSS · shadcn/ui ·
lucide-react · React Hook Form · Zod · Supabase (Auth + PostgreSQL +
Storage) · OpenAI API · Vercel · Vitest / React Testing Library / Playwright.

## Cómo levantar el proyecto en local

```bash
pnpm install
cp .env.example .env.local
# rellena .env.local con tus credenciales de Supabase y OpenAI
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver [`.env.example`](.env.example). Resumen:

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y servidor | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor | Clave anónima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor | Clave con privilegios elevados |
| `OPENAI_API_KEY` | solo servidor | Generación de informes con IA |
| `NEXT_PUBLIC_SITE_URL` | cliente y servidor | URL pública del sitio (SEO: metadata, sitemap, robots) |

`.env.local` nunca se sube al repositorio.

## Documentación

- [`docs/producto.md`](docs/producto.md) — producto, usuarios, alcance del MVP.
- [`docs/arquitectura.md`](docs/arquitectura.md) — decisiones de arquitectura y stack.
- [`docs/modelo-datos.md`](docs/modelo-datos.md) — esquema de tablas.
- [`docs/ia.md`](docs/ia.md) — estrategia de IA y versión de prompt vigente.
- [`database/schema-notes.md`](database/schema-notes.md) — notas de esquema SQL y RLS.

## Estado del proyecto

- **Sprint 0 (Fase 0) — completada**: proyecto Next.js + TypeScript +
  Tailwind + shadcn/ui inicializado, estructura de carpetas creada, wrappers
  de Supabase y OpenAI, `.env.example` documentado. Proyecto real de
  Supabase creado y conectado (`.env.local` configurado).
- **Identidad visual aplicada**: paleta (terracota/salvia), tipografía
  (Public Sans) y radios de borde definidos en `src/app/globals.css` a
  partir de un prototipo visual (Stitch). Landing pública (`(public)/page.tsx`)
  ya usa estos tokens como primera aplicación real. Ver detalle en
  [`docs/arquitectura.md`](docs/arquitectura.md).
- **SEO base implementado**: metadata (title template, description, Open
  Graph, Twitter Card, canonical), `robots.ts`/`sitemap.ts` (App Router),
  datos estructurados JSON-LD (`schema.org/Service`) en la landing, y
  `noindex` en las áreas privadas `(client)` y `admin`. Recuerda configurar
  `NEXT_PUBLIC_SITE_URL` con la URL real al desplegar.
- **Fase 1 (Base de datos y autenticación) — completada**: esquema SQL y
  políticas RLS aplicados y verificados en Supabase (ver
  [`database/schema-notes.md`](database/schema-notes.md)). Registro
  (`/register`) e inicio de sesión (`/login`) implementados con Supabase
  Auth, redirección según rol tras login, protección de `(client)` (sesión)
  y `admin` (sesión + rol admin, comprobado en servidor), y cierre de
  sesión. Todo verificado extremo a extremo contra el proyecto real.
- **Fase 2 (Área pública)**: cubierta parcialmente por la landing del
  Sprint 0 (hero, cómo funciona, servicios). Pendiente explícitamente
  pospuesto: comprobación de responsive dedicada y página `/services`
  separada — no bloquea el flujo principal, se retomará más adelante.
- **Fase 3 (Gestión de mascotas) — completada**: CRUD completo (`/pets`,
  `/pets/new`, `/pets/[petId]`, `/pets/[petId]/edit`) con formulario único
  reutilizable (React Hook Form + Zod), organizado en datos básicos,
  cuidado/salud y comportamiento. Ownership garantizado por RLS (cada
  cliente solo ve/edita/elimina sus propias mascotas). Fotografía principal
  pospuesta a la Fase 8 (Storage). Verificado extremo a extremo: crear,
  listar, ver detalle, editar y eliminar.
- **Fase 4 (Gestión de reservas) — completada**: solicitud de reserva por
  el cliente (`/bookings/new`, selecciona mascota propia y servicio activo),
  listado propio (`/bookings`) y detalle (`/bookings/[bookingId]`);
  panel de administradora (`/admin/bookings` listado en tabla,
  `/admin/bookings/[bookingId]` con datos de cliente, información de
  cuidado de la mascota y botones de cambio de estado según transición
  válida: pendiente→aceptada/rechazada, aceptada→completada/cancelada).
  Estado inicial siempre `pending` (forzado por trigger en BD), cambios de
  estado restringidos a administradora (RLS). Verificado extremo a
  extremo: crear solicitud → aceptar como admin → estado reflejado para
  el cliente.
- **Fase 5 (Registro de visitas) — completada**: la administradora crea
  una visita (`/admin/visits/new?bookingId=`) desde una reserva aceptada o
  completada — enlazado desde el detalle de la reserva ("Crear visita" /
  "Ver visita" según exista ya). Formulario con fecha/hora, duración,
  estado general, checklist de 7 cuidados (checkboxes nativos), notas
  rápidas e incidencias. Detalle de visita (`/admin/visits/[visitId]`)
  muestra el checklist marcado y las notas. Aún no visible para el
  cliente (RLS: solo cuando exista un informe publicado — Fase 7).
  Verificado extremo a extremo: crear visita desde una reserva aceptada,
  ver su detalle, y que el enlace cambia a "Ver visita" tras crearla.
  Pendiente para fases siguientes: diario automático con IA (Fase 6).
