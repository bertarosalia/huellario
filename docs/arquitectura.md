# Arquitectura

## Decisión

Next.js (App Router) full-stack + Supabase (Auth, PostgreSQL, Storage) +
OpenAI API. Monolito modular: un único proyecto organizado por módulos
funcionales, sin backend separado.

Justificación resumida: evita levantar y desplegar dos aplicaciones para un
MVP individual, aprovecha el perfil frontend de la autora, y Supabase cubre
autenticación + base de datos relacional + storage sin construir
infraestructura desde cero. Detalle de alternativas descartadas (backend
separado con NestJS, Firebase): Obsidian `5. Arquitectura/Decision-de-arquitectura.md`.

## Estructura de carpetas

```
app/
  (public)/   → rutas públicas, sin auth
  (auth)/     → login, registro
  (client)/   → área privada cliente (requiere sesión)
  admin/      → panel administradora (requiere sesión + rol admin)
  api/        → rutas API (ej. api/ai/generate-report)

components/
  ui/         → shadcn/ui
  layout/ forms/ pets/ bookings/ visits/ reports/ admin/

features/<dominio>/
  actions.ts  → mutaciones
  queries.ts  → lecturas
  schemas.ts  → validación Zod
  types.ts    → tipos TS

lib/
  supabase/   → client.ts, server.ts, middleware.ts
  openai/     → client.ts, generate-report.ts (pendiente de Fase 6)
  utils.ts, constants.ts

database/
  migrations/, seed.sql, schema-notes.md
```

## Seguridad (resumen)

- Rutas `(client)` y `admin` protegidas por sesión vía `src/proxy.ts` (convención
  de Next.js 16, sustituye a `middleware.ts`) + `src/lib/supabase/middleware.ts`.
  La comprobación de rol `admin` (más allá
  de sesión activa) se hará en servidor dentro de cada ruta/acción de
  `admin/*`, no solo en middleware — pendiente de Fase 1.
- RLS activo en todas las tablas con datos privados (pendiente de Fase 1,
  aún no se han creado las tablas).
- Claves privadas (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) solo en
  servidor; `lib/openai/client.ts` importa `server-only` para reforzarlo.

## Identidad visual

Tokens de diseño extraídos de un prototipo visual hecho en Stitch (Google
Labs) y aplicados como CSS custom properties en `src/app/globals.css`
(mapeados a las variables semánticas que usa shadcn/ui: `background`,
`primary`, `secondary`, etc.):

- Color primario: terracota `#9d3d2e`. Secundario: verde salvia `#4c644e`
  (vía `--secondary`/`--secondary-container`). Terciario: tostado `#7d5231`.
- Tipografía: Public Sans (`next/font/google`, variable `--font-sans`),
  sustituye a Geist Sans del scaffold inicial.
- Radio de borde base: `0.75rem`.

El prototipo original usa iconos Material Symbols; se han sustituido por
`lucide-react` (mapeo 1:1 por significado) para no introducir una segunda
librería de iconos, ya que CLAUDE.md fija `lucide-react` como librería única.

El componente base de shadcn/ui usa `@base-ui/react` (estilo "base-nova" del
registro), no Radix: los componentes interactivos (`Button`, etc.) reciben
una prop `render` en vez de `asChild` para delegar el elemento renderizado
(p. ej. `<Button render={<Link href="/login" />}>`).

## Estado actual (Sprint 0)

- [x] Next.js + TypeScript + Tailwind CSS v4 + shadcn/ui inicializados.
- [x] Estructura de carpetas creada.
- [x] Wrappers de Supabase (`client.ts`, `server.ts`, `middleware.ts`) y de
      OpenAI (`client.ts`) creados, sin lógica de negocio todavía.
- [ ] Proyecto Supabase real conectado (pendiente: crear proyecto, rellenar
      `.env.local`, validar conexión).
- [ ] Tablas y RLS (Fase 1).
