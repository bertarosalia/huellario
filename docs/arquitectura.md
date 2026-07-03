# Arquitectura

## Decisión

Next.js (App Router) full-stack + Supabase (Auth, PostgreSQL, Storage) +
Google Gemini API. Monolito modular: un único proyecto organizado por
módulos funcionales, sin backend separado.

(La IA se decidió inicialmente con OpenAI API; se cambió a Google Gemini en
la Fase 6 por requerir OpenAI un método de pago activo incluso para uso
mínimo, mientras que Gemini ofrece tier gratuito sin tarjeta. No cambia
nada más de la arquitectura: sigue llamándose solo desde servidor, con
Structured Outputs y el mismo flujo de borrador → revisión → publicación.)

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
  ai/         → client.ts, generate-report.ts (Google Gemini)
  utils.ts, constants.ts

database/
  migrations/, seed.sql, schema-notes.md
```

## Seguridad (resumen)

- Rutas `(client)` y `admin` protegidas por sesión vía `src/proxy.ts` (convención
  de Next.js 16, sustituye a `middleware.ts`) + `src/lib/supabase/middleware.ts`.
  La comprobación de rol `admin` se revalida además en servidor en el
  layout de `admin/*` (no solo en middleware).
- RLS activo en todas las tablas con datos privados.
- Claves privadas (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) solo en
  servidor; `lib/ai/client.ts` importa `server-only` para reforzarlo.

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

## Estado actual

Fases 0-6 completadas (ver "Estado del proyecto" en `README.md` para el
detalle por fase). Wrappers de Supabase y de IA (`lib/ai/client.ts`,
`lib/ai/generate-report.ts`, Google Gemini) en uso desde la Fase 6.
