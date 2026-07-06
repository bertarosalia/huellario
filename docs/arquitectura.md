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

## Testing (Fase 10)

Vitest + React Testing Library, configurados en `vitest.config.mts` (no
`.ts`: con `.ts` la config se cargaba como CJS y fallaba con
`ERR_REQUIRE_ESM` en este proyecto; `.mts` fuerza carga ESM sin depender
de `"type": "module"` en `package.json`).

**Versiones de devDependencies fijadas por debajo de la última, a
propósito** — no son un descuido, son compatibilidad con el Node instalado
en este entorno (`v21.6.1`):

- `vitest` en `^3` (no `^4`): la v4 arrastra una Vite basada en Rolldown
  que usa `styleText` de `node:util`, disponible solo desde Node `20.12`/`21.7`.
- `@vitejs/plugin-react` en `^4` (no `^6`): la v6 exige Vite `^8`; este
  proyecto queda en Vite `7.x` por la restricción anterior.
- `jsdom` en `^25` (no `^29`): la v29 tiene una dependencia
  (`html-encoding-sniffer` → `@exodus/bytes`) con un `require()` de un
  módulo ESM que rompe en este Node.

Si se actualiza la versión de Node del entorno más adelante, se puede
revisar si estas fijaciones siguen siendo necesarias.

Lógica de negocio separada de `generate-report.ts` (que importa
`server-only`, no cargable en tests) hacia `lib/ai/prompt.ts` (funciones
puras: construcción del prompt, formateo del texto final), específicamente
para poder testear la minimización de datos hacia la IA.

## Notificaciones por email (Fase 11)

Se añade `resend` como proveedor de email transaccional (mismo criterio que
Gemini: tier gratuito sin tarjeta, SDK simple, pensado para Vercel). Nuevo
módulo `lib/email/` con el mismo patrón que `lib/ai/`: `client.ts`
(`server-only`, wrapper del SDK), `templates.ts` (funciones puras, sin
`server-only`, testeables) y `send.ts` (envío real, con try/catch propio
para que un fallo de email nunca bloquee ni revierta una mutación de
reserva — el email es un efecto secundario, no la operación crítica).

**Pendiente explícito — cuenta de Resend en modo sandbox**: mientras no se
verifique un dominio propio en resend.com/domains, Resend solo permite
enviar a la dirección con la que se creó la cuenta. Esto significa que, en
el estado actual, **ningún email llega a destinatarios reales** (ni
`ADMIN_EMAIL` ni los clientes) — los envíos fallan en silencio (por
diseño, no bloquean la reserva) pero no hay entrega real. No es un bug de
código: requiere que el propietario del proyecto tenga un dominio propio y
lo verifique en Resend para salir del sandbox.

## Bugs encontrados y corregidos en verificación de producción

- **Subida de fotos bloqueada por el límite de Server Actions de
  Next.js**: por defecto Next.js limita el payload de una Server Action a
  1MB, pero `MAX_PHOTO_SIZE_BYTES` (`lib/supabase/storage.ts`) permite
  fotos de hasta 5MB — cualquier foto real de móvil (2-8MB típico)
  quedaba bloqueada antes de llegar a la validación propia de la app. Se
  añade `experimental.serverActions.bodySizeLimit: "6mb"` en
  `next.config.ts`.
- **Sin navegación de vuelta tras generar un informe con IA**: la página
  `/admin/reports/[reportId]/edit` no tenía ningún enlace de vuelta a la
  visita/reserva de origen. Se añade un enlace "Volver a la visita"
  usando `report.visit_id` (ya disponible en el tipo `Report`).

`SUPABASE_SERVICE_ROLE_KEY` empieza a usarse en código a partir de esta
fase (hasta ahora solo estaba documentada): `lib/supabase/admin.ts` la usa
en un único punto acotado —`supabase.auth.admin.getUserById()`— para
resolver el email de un cliente a partir de `client_id`, ya que `profiles`
no duplica el email (vive en `auth.users`). No se usa para nada más.

Disparo: `createBookingAction` (nueva solicitud → email a `ADMIN_EMAIL` +
confirmación al cliente) y `updateBookingStatusAction` (cambio de estado →
email de resolución al cliente) en `features/bookings/actions.ts`.

## Estado actual

Fases 0-10 completadas, Fase 11 en curso (ver "Estado del proyecto" en
`README.md` para el detalle por fase). Wrappers de Supabase y de IA
(`lib/ai/client.ts`, `lib/ai/generate-report.ts`, Google Gemini) en uso
desde la Fase 6; wrapper de email (`lib/email/`) desde la Fase 11.
