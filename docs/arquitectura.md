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

**Resuelto — dominio propio verificado en Resend**: se compró `huellario.com`
(Porkbun) y se verificó en resend.com/domains (registros DNS TXT/CNAME).
`EMAIL_FROM` pasa de `onboarding@resend.dev` (sandbox, solo entregaba a la
dirección de la cuenta) a `notificaciones@huellario.com` — dirección de
solo envío, sin buzón real detrás (no hace falta: Resend solo necesita el
dominio verificado para autenticar el envío, no una cuenta de correo).
Con esto el sandbox queda superado: los emails llegan a cualquier
destinatario, tanto `ADMIN_EMAIL` como los clientes.

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
- **Email de confirmación de registro apuntaba a `localhost:3000` en
  producción**: `supabase.auth.signUp()` se llamaba sin `emailRedirectTo`
  en `features/auth/actions.ts`, así que Supabase construía el link del
  email con su propio "Site URL" (Authentication → URL Configuration en
  el dashboard de Supabase) en vez de con la URL del entorno — y ese Site
  URL se había quedado en `http://localhost:3000` desde la Fase 1, sin
  actualizar al desplegar. Se fija explícitamente `emailRedirectTo`
  (apuntando a `SITE_URL` + `/login`) en el `signUp()`, y se corrige
  el Site URL / Redirect URLs del proyecto de Supabase a
  `https://www.huellario.com`. `NEXT_PUBLIC_SITE_URL` (antes solo SEO)
  pasa a tener también esta responsabilidad — debe coincidir con lo
  configurado en Supabase.
- **Dominio raíz `huellario.com` no servía la app**: solo
  `www.huellario.com` estaba conectado a Vercel; la raíz tenía el
  registro `ALIAS` por defecto de Porkbun apuntando a su página de
  "dominio aparcado" (un `ALIAS`/`CNAME` no puede coexistir con otros
  registros, así que además bloqueaba añadir el de Vercel). Se desactivó
  el URL forwarding de Porkbun en la raíz, se añadió el registro `A` que
  indicó Vercel, y se configuró `huellario.com` para redirigir a
  `www.huellario.com` (dominio canónico elegido) desde el propio panel
  de dominios de Vercel — evita contenido duplicado de cara a SEO.
- **Registro con un email ya existente no daba ninguna pista al
  usuario**: cuando el email ya tiene cuenta confirmada, Supabase
  devuelve éxito en `signUp()` sin mandar email — es una protección
  propia contra enumeración de cuentas (evita que se pueda averiguar qué
  emails están registrados probando el formulario), no un bug. Se decide
  no romper esa protección: el mensaje de éxito en
  `(auth)/register/page.tsx` queda ambiguo a propósito (no confirma ni
  desmiente si la cuenta ya existía) pero da una salida clara — enlace a
  iniciar sesión, o a contacto si no recuerda la contraseña. Pendiente,
  fuera de alcance de esta tarea: no existe todavía un flujo de
  recuperación de contraseña propio (`resetPasswordForEmail`); por ahora
  la única salida para ese caso es contactar directamente.

`SUPABASE_SERVICE_ROLE_KEY` empieza a usarse en código a partir de esta
fase (hasta ahora solo estaba documentada): `lib/supabase/admin.ts` la usa
en un único punto acotado —`supabase.auth.admin.getUserById()`— para
resolver el email de un cliente a partir de `client_id`, ya que `profiles`
no duplica el email (vive en `auth.users`). No se usa para nada más.

Disparo: `createBookingAction` (nueva solicitud → email a `ADMIN_EMAIL` +
confirmación al cliente) y `updateBookingStatusAction` (cambio de estado →
email de resolución al cliente) en `features/bookings/actions.ts`.

## Recuperación de contraseña y cierre de cuenta

**Recuperar contraseña**: flujo estándar de Supabase Auth
(`resetPasswordForEmail` + `updateUser`), con el mismo `emailRedirectTo`
explícito que ya usa el registro. El detalle técnico es cómo llega la
sesión a `/reset-password`: el link del email trae los tokens en el
fragmento de la URL (`#access_token=...&type=recovery`), que **solo el
navegador puede leer** — nunca llega al servidor. Por eso
`/reset-password` es un componente cliente: al montarse, instancia el
cliente de Supabase del navegador (`lib/supabase/client.ts`), que detecta
automáticamente ese fragmento y guarda la sesión en cookies (comportamiento
por defecto de `createBrowserClient` de `@supabase/ssr`, pensado
justamente para mantener sincronizados cliente y servidor). Con la cookie
ya puesta, el envío del formulario sí puede resolverse con una Server
Action normal (`updatePasswordAction`, cliente de servidor basado en
cookies) — sin eso, `supabase.auth.getUser()` en el servidor no vería
ninguna sesión y el cambio de contraseña fallaría siempre.

**Cerrar cuenta**: la cascada de borrado en base de datos ya estaba bien
montada desde la Fase 1 (`auth.users` → `profiles` → `pets` →
`bookings`/`visits`/`reports`/`reviews`, todo `on delete cascade`, ver
`database/migrations/0001_init.sql`), así que borrar la cuenta es
sobre todo un problema de **Storage**, que no forma parte de esa cascada:
las fotos de mascota y de visita quedarían huérfanas si no se borran a
mano. `deleteUserAccount` (`lib/supabase/admin.ts`, nueva función sobre el
cliente admin ya existente) hace, en este orden: (1) lista las fotos de
las mascotas del usuario y las de sus visitas — con el cliente **admin**,
no el del usuario, porque RLS solo deja ver las fotos de una visita al
cliente cuando el informe ya está publicado, y aquí hace falta verlas
todas, publicadas o no; (2) las borra de Storage; (3) borra el usuario de
`auth.users` (`auth.admin.deleteUser`, requiere service role), lo que
dispara la cascada de BD. El id del usuario a borrar sale siempre de
`supabase.auth.getUser()` en el servidor, nunca de un campo del
formulario — para que esta acción nunca pueda apuntar a la cuenta de otra
persona.

## Aviso — directorio de trabajo temporal

El entorno de desarrollo de esta autora ha trabajado en algunas sesiones
sobre `/private/tmp/huellario`, que macOS limpia periódicamente (no solo
al reiniciar: se ha observado que borra archivos no modificados
recientemente aunque el sistema siga encendido, incluyendo objetos
internos de `.git`). Esto ha causado dos pérdidas parciales de archivos
durante el desarrollo. El directorio de trabajo real y permanente es
`~/Documents/berta-docs/TFM/huellario-backup` (con el mismo remoto de
GitHub) — cualquier sesión nueva debería partir de ahí, no de `/tmp`.

## Estado actual

Fases 0-10 completadas, Fase 11 en curso (ver "Estado del proyecto" en
`README.md` para el detalle por fase). Wrappers de Supabase y de IA
(`lib/ai/client.ts`, `lib/ai/generate-report.ts`, Google Gemini) en uso
desde la Fase 6; wrapper de email (`lib/email/`) desde la Fase 11.
