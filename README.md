# Huellario

Plataforma web de gestión de servicios de pet sitting a domicilio, con
generación automática de diarios de visita mediante IA. TFM individual.

## Descripción general

Huellario conecta a una cuidadora de mascotas (administradora) con sus
clientes: los clientes registran sus mascotas y solicitan reservas de
servicios a domicilio (visitas, paseos, cuidado prolongado o con
medicación); la administradora gestiona esas reservas y, tras cada visita,
registra cómo ha ido. Su funcionalidad diferencial es el **diario
automático con IA**: a partir de los datos de la mascota y de la visita,
Google Gemini genera un borrador de informe personalizado que la
administradora siempre revisa, edita si hace falta y publica manualmente
antes de que el cliente pueda verlo — el informe nunca se autopublica.

El resto de la plataforma cubre el ciclo completo alrededor de ese diario:
autenticación con roles (cliente/administradora), fichas de mascota con
información relevante para su cuidado, fotos (de la mascota y de cada
visita), reseñas verificadas con posibilidad de mostrar la foto de la
mascota (con consentimiento explícito), notificaciones por email en el
flujo de reservas, y recuperación/cierre de cuenta.

## Despliegue y recursos del TFM

| Recurso | Enlace |
|---|---|
| Proyecto en producción | **https://www.huellario.com** |
| Repositorio | https://github.com/bertarosalia/huellario |
| Slides de la presentación | https://canva.link/v2ronei8vacnqtg |
| Vídeo explicativo | https://canva.link/cbv20ecm6z2d4rm |
| Usuario/contraseña de prueba | facilitados en el formulario de entrega del TFM, no publicados aquí |

## Funcionalidades principales

- **Autenticación con roles** (Supabase Auth): registro con confirmación
  por email, login, recuperación de contraseña, cierre de cuenta
  (borrado permanente de datos y fotos), protección de rutas por sesión
  y por rol (`client` / `admin`).
- **Gestión de mascotas**: alta con información relevante para su cuidado
  (alimentación, medicación, comportamiento, miedos, necesidades
  especiales) y foto principal.
- **Reservas**: el cliente solicita servicio/fecha/hora; la administradora
  acepta, rechaza, marca como completada o cancela, con notificación por
  email al cliente en cada cambio de estado.
- **Registro de visitas**: checklist de cuidados, notas, incidencias y
  fotos, a cargo de la administradora.
- **Diario con IA**: generación de un borrador de informe con Google
  Gemini a partir únicamente de los datos de la mascota y la visita
  (nunca datos de contacto del cliente), revisión/edición y publicación
  manual por la administradora; el cliente solo ve el informe una vez
  publicado.
- **Reseñas verificadas**: el cliente puntúa y comenta tras una reserva
  completada, moderadas por la administradora antes de aparecer en la
  landing pública; opción de mostrar la foto de la mascota en la reseña
  pública, siempre con consentimiento explícito del dueño.
- **Panel de administración**: gestión de reservas, visitas, informes y
  reseñas desde un área separada y protegida por rol.

## Estructura del proyecto

```
src/
  app/
    (public)/      → landing, privacidad, términos, contacto (sin auth)
    (auth)/        → login, registro, recuperar/restablecer contraseña
    (client)/      → área privada del cliente (mascotas, reservas, informes)
    admin/         → panel de la administradora (reservas, visitas, reseñas)

  components/
    ui/            → componentes base (shadcn/ui)
    layout/        → headers, footer
    auth/          → componentes de autenticación (p. ej. cierre de cuenta)
    pets/ bookings/ visits/ reports/ reviews/ admin/
                   → componentes específicos por dominio

  features/
    <dominio>/       (auth, pets, bookings, visits, reports, reviews)
      actions.ts    → mutaciones (Server Actions)
      queries.ts    → lecturas
      schemas.ts    → validación con Zod
      types.ts      → tipos TypeScript del dominio

  lib/
    supabase/      → clientes de Supabase (server, browser, admin, storage)
    ai/            → cliente e integración con Google Gemini
    email/         → plantillas y envío de emails transaccionales (Resend)
    constants.ts, utils.ts

database/
  migrations/      → SQL versionado (esquema, RLS, funciones)
  seed.sql         → datos iniciales
  schema-notes.md  → notas y decisiones sobre el esquema

docs/              → documentación técnica (producto, arquitectura, modelo de datos, IA)
tests/             → tests unitarios (Vitest)
```

## Stack técnico

Next.js (App Router) · TypeScript · React · Tailwind CSS · shadcn/ui ·
lucide-react · React Hook Form · Zod · Supabase (Auth + PostgreSQL +
Storage) · Google Gemini API · Vercel · Vitest / React Testing Library / Playwright.

## Cómo levantar el proyecto en local

```bash
pnpm install
cp .env.example .env.local
# rellena .env.local con tus credenciales de Supabase y Google Gemini
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Tests

```bash
pnpm test        # ejecuta toda la suite una vez
pnpm test:watch  # modo watch
```

Cobertura actual (Fase 10, flujos críticos según `CLAUDE.md`): validaciones
de todos los formularios (auth, mascotas, reservas, visitas, reseñas) y la
construcción del prompt de IA — incluye un test que falla si algún dato de
contacto del cliente se filtra al prompt (minimización de datos). Los
permisos de acceso (RLS) no tienen test unitario propio: se verifican
manualmente contra el proyecto real de Supabase en cada fase (ver
`database/schema-notes.md`).

## Variables de entorno

Ver [`.env.example`](.env.example). Resumen:

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y servidor | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor | Clave anónima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor | Clave con privilegios elevados |
| `GEMINI_API_KEY` | solo servidor | Generación de informes con IA (Google Gemini, tier gratuito) |
| `GEMINI_MODEL` | solo servidor | Modelo de Gemini a usar (opcional, por defecto `gemini-2.5-flash`) |
| `NEXT_PUBLIC_SITE_URL` | cliente y servidor | URL pública del sitio (SEO: metadata, sitemap, robots) |
| `RESEND_API_KEY` | solo servidor | Envío de emails transaccionales (Resend, tier gratuito) |
| `EMAIL_FROM` | solo servidor | Remitente de los emails (dominio sandbox de Resend hasta verificar uno propio) |
| `ADMIN_EMAIL` | solo servidor | Destinatario de las notificaciones de nueva solicitud de reserva |

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
  de Supabase y de IA, `.env.example` documentado. Proyecto real de
  Supabase creado y conectado (`.env.local` configurado).
- **Identidad visual aplicada**: paleta (terracota/salvia), tipografía
  (Public Sans) y radios de borde definidos en `src/app/globals.css` a
  partir de un prototipo visual (Stitch). Landing pública (`(public)/page.tsx`)
  ya usa estos tokens como primera aplicación real. Ver detalle en
  [`docs/arquitectura.md`](docs/arquitectura.md).
- **SEO base implementado**: metadata (title template, description, Open
  Graph, Twitter Card, canonical), `robots.ts`/`sitemap.ts` (App Router),
  datos estructurados JSON-LD (`schema.org/Service`) en la landing, y
  `noindex` en las áreas privadas `(client)` y `admin`. `NEXT_PUBLIC_SITE_URL`
  quedó configurado con la URL real (`https://www.huellario.com`) al
  desplegar — verificado más adelante contra el `sitemap.xml` en producción.
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
- **Fase 6 (Diario automático con IA) — completada**: `src/lib/ai/` genera
  el informe con **Google Gemini API** (no OpenAI — cambio de proveedor
  decidido en esta fase por requerir OpenAI método de pago activo; ver
  `docs/ia.md`), usando Structured Outputs (JSON Schema) para title,
  summary, story, care_summary, incidents y owner_message, minimizando los
  datos enviados (solo mascota + visita + checklist + notas + incidencias,
  nunca datos de contacto del cliente). El resultado se serializa a un
  único texto formateado y se guarda en `reports` como `draft`. Desde el
  detalle de visita: botón "Generar informe con IA" → editor
  (`/admin/reports/[reportId]/edit`) con texto editable, "Guardar borrador"
  y "Publicar informe". Trazabilidad guardada: modelo, versión de prompt,
  fecha de generación/publicación. Verificado extremo a extremo con la API
  real de Gemini: generar informe desde una visita → texto coherente y
  fiel a los datos → publicar → badge de estado actualizado.
- **Fase 7 (Consulta de informes por el cliente) — completada**: listado
  (`/reports`) y detalle (`/reports/[reportId]`) de diarios publicados,
  solo lectura, sin metadatos internos de IA (nunca se muestra modelo,
  versión de prompt ni el texto sin editar). Enlace "Ver diario" desde el
  detalle de reserva del cliente cuando ya existe informe publicado para
  su visita. RLS garantiza que un cliente nunca vea informes en borrador
  ni de otras mascotas. Verificado extremo a extremo: el diario publicado
  en la Fase 6 aparece en el dashboard, el listado y el detalle de reserva
  del cliente.

Con esto queda cerrado el flujo principal completo del MVP (registro →
mascota → reserva → visita → diario con IA → publicación → consulta).

- **Fase 8 (Fotografías) — completada**: Supabase Storage con bucket
  privado único `photos` (rutas `pets/{petId}/...` y `visits/{visitId}/...`).
  Subida de foto principal de mascota desde su detalle, y de fotos de
  visita desde el detalle de visita (admin) — visibles en galería tanto
  para la administradora como en el diario publicado del cliente. Las
  imágenes se sirven siempre con URLs firmadas temporales, nunca públicas.
  Durante la implementación se descubrió que las políticas de RLS sobre
  `storage.objects` no pueden usar un `EXISTS` directo contra otra tabla
  con RLS (ven cero filas, aunque la misma condición evaluada manualmente
  o vía PostgREST sí funciona) — solución documentada en
  `database/schema-notes.md`: envolver la comprobación en una función
  `SECURITY DEFINER`, igual que ya hacía `is_admin()`. Verificado extremo
  a extremo: subida de ambos tipos de foto y visualización correcta según
  el rol.

- **Fase 9 (Reseñas verificadas) — completada**: el cliente puede dejar una
  reseña (puntuación 1-5 + comentario opcional) desde una reserva
  `completed`, una única vez (restricción de BD por `booking_id` único +
  trigger). Nace en estado `pending`; la administradora la modera en
  `/admin/reviews` (Publicar/Ocultar). Solo las reseñas publicadas
  aparecen en la landing pública, sin datos privados de cliente ni
  mascota más allá de puntuación + comentario + "Cliente verificado" (ver
  excepción de la foto de mascota, con consentimiento explícito, más
  abajo), tal como pedía el alcance funcional. Verificado extremo a
  extremo: crear reseña → moderar → visible en la web pública para un
  visitante sin sesión.

- **Fase 10 (Testing, refinamiento y despliegue) — completada**: Vitest +
  React Testing Library configurados y con 37 tests pasando (validaciones
  de todos los formularios críticos + minimización de datos hacia la IA +
  un test de componente). Ver `pnpm test` y detalle en `docs/arquitectura.md`
  (incluye por qué algunas devDependencies quedan fijadas a versiones
  concretas, por compatibilidad con el Node del entorno).
  Revisión responsive completada: repasadas en móvil (375px), tablet
  (768px) y escritorio todas las pantallas principales (landing, auth,
  dashboards, mascotas, reservas, visitas, informes, reseñas). Se encontró
  y corrigió un bug real: el nav de cliente/administradora se cortaba en
  móvil sin forma de acceder a los enlaces ni a "Cerrar sesión" — ahora usa
  un menú `<details>/<summary>` nativo (accesible sin JS de más) por debajo
  de `md`. También se corrigió la tabla de reservas admin, que quedaba
  recortada (`overflow-hidden`) en vez de scrollable en pantallas estrechas.
  Estados vacíos y mensajes de error revisados: `registerAction` ya traduce
  los errores de Supabase a mensajes en español (antes se mostraban en
  inglés tal cual), y se añadieron páginas propias `not-found.tsx`/`error.tsx`
  con la identidad visual de Huellario en vez de las genéricas de Next.
  También se corrigió `.gitignore`, que excluía por error `.env.example`
  del repo (patrón `.env*` demasiado amplio).
- **Fase 10 — despliegue en Vercel completado**: proyecto conectado al
  repo de GitHub (`bertarosalia/huellario`, rama `main`, deploy automático
  en cada push), variables de entorno de producción configuradas
  (Supabase, Gemini, `NEXT_PUBLIC_SITE_URL`). En producción en
  **https://www.huellario.com** (dominio propio conectado más adelante,
  ver entrada posterior; `huellario.vercel.app` sigue funcionando pero ya
  no es la URL canónica).

- **Fase 11 (Notificaciones por email de reservas) — completada**: al
  crear una solicitud de reserva, la administradora recibe un email a
  `ADMIN_EMAIL` con los datos clave, y el cliente recibe una confirmación
  de recepción indicando el plazo de respuesta
  (`BOOKING_RESPONSE_SLA_DAYS` en `lib/constants.ts`). Al cambiar el
  estado de una reserva (aceptar/rechazar/completar/cancelar), el cliente
  recibe un email con la resolución. Proveedor: Resend (tier gratuito).
  Nuevo módulo `lib/email/` (mismo patrón que `lib/ai/`: cliente
  `server-only`, plantillas puras testeables, envío con manejo de errores
  que nunca bloquea la reserva). Primer uso en código de
  `SUPABASE_SERVICE_ROLE_KEY`, acotado a `lib/supabase/admin.ts` para
  resolver el email de un cliente por id. 8 tests nuevos de plantillas
  (45 en total). Detalle en `docs/arquitectura.md`.
  Dominio propio `huellario.com` (Porkbun) verificado en Resend —
  `EMAIL_FROM=notificaciones@huellario.com` — con lo que los emails ya
  llegan a cualquier destinatario real (admin y clientes), no solo a la
  dirección de la cuenta de Resend. Verificados extremo a extremo en
  producción los tres emails: nueva solicitud a la administradora,
  confirmación de recepción al cliente, y resolución al cambiar el
  estado de la reserva.
  Verificando en producción se encontraron y corrigieron dos bugs más:
  la subida de fotos fallaba con fotos reales de móvil por el límite de
  1MB por defecto de las Server Actions de Next.js (ahora `6mb` en
  `next.config.ts`), y la página de revisión del informe de IA no tenía
  forma de volver a la visita (ahora tiene un enlace "Volver a la
  visita").

- **Footer de la landing pública**: nuevo componente
  `components/layout/public-footer.tsx` (marca, enlaces legales,
  copyright), a partir de un diseño de referencia (Stitch). Solo en el
  área pública `(public)`, no en cliente/admin. Se crean las páginas
  reales `/privacidad`, `/terminos` y `/contacto` (contenido mínimo,
  ampliable), añadidas a `sitemap.ts`. El email de contacto público es
  el Gmail personal de la administradora (`notificaciones@huellario.com`
  es solo de envío, sin bandeja real).

- **Navegación de vuelta en páginas de detalle**: además del informe de
  IA (Fase 10), se añade enlace "Volver a..." en el resto de páginas de
  solo lectura que no tenían ninguna forma de volver salvo el botón atrás
  del navegador: mascota, reserva (cliente y admin), informe del cliente
  y visita (admin). Las páginas con formulario ya tenían "Cancelar"
  (`router.back()`), así que no lo necesitaban.

- **Eliminar fotos de una visita**: hasta ahora solo se podían añadir,
  nunca borrar. Nueva `deleteVisitPhotoAction` en
  `features/visits/actions.ts` (borra de Storage y de `visit_photos`) y
  componente `VisitPhotoManager` con un botón de eliminar por foto, solo
  en la vista de administradora (el cliente sigue viendo la galería de
  solo lectura sin controles, `VisitPhotoGallery`).

- **Mejora la UI de subida de fotos**: el `<input type="file">` nativo
  desnudo (mascota y visita) se sustituye por una zona clicable con
  icono, borde punteado y estados hover/focus, usando `label`/`input`
  reales (`useId`, sin JS a medida) para no perder accesibilidad nativa.

- **Foto de mascota en reseñas públicas (con consentimiento) — completada**:
  nuevo checkbox en el formulario de reseña ("Mostrar la foto de tu
  mascota en la reseña pública"), visible solo si la mascota tiene foto
  principal. Es consentimiento por reseña, no un ajuste persistente de la
  mascota. Nueva columna `reviews.show_pet_photo` y dos funciones
  `SECURITY DEFINER` (`can_view_pet_review_photo`,
  `get_published_reviews_public`) que garantizan en la propia base de
  datos que la foto solo se expone a un visitante anónimo cuando hay
  consentimiento — mismo patrón ya usado para
  `owns_pet`/`can_view_visit_photos` en la Fase 8. Verificado extremo a
  extremo contra el proyecto real: dejar reseña con el checkbox marcado →
  publicar como admin → foto visible en la landing sin sesión, y ausente
  en reseñas sin consentimiento o de mascotas sin foto principal. Ver
  detalle en `database/schema-notes.md`.

- **Favicon**: `src/app/icon.svg` (convención de App Router, sin metadata
  manual) con la huella (`PawPrint` de lucide-react) sobre un círculo del
  color primario de marca, sustituyendo el favicon por defecto de Next.js
  que quedaba sin usar.

- **Corregido: email de confirmación de registro apuntaba a localhost en
  producción**: causa real — `supabase.auth.signUp()` no fijaba
  `emailRedirectTo`, así que Supabase usaba su propio "Site URL" (dashboard
  de Supabase), que se había quedado en `localhost:3000` desde la Fase 1.
  Se añade `emailRedirectTo` (apuntando a `SITE_URL` + `/login`) en
  `features/auth/actions.ts`, y se corrige el Site URL / Redirect URLs en
  el dashboard de Supabase. De paso se detectó y arregló que el dominio
  raíz `huellario.com` no servía la app (solo `www.huellario.com` estaba
  conectado a Vercel): se liberó el registro `ALIAS` por defecto de
  Porkbun, se añadió el `A` que pide Vercel, y se configuró la raíz para
  redirigir a `www.huellario.com` (dominio canónico). Detalle completo en
  `docs/arquitectura.md`.

- **Mensaje ambiguo al registrarse con un email ya existente**: Supabase
  no manda email ni da error en ese caso (protección propia contra
  enumeración de cuentas), así que antes el usuario se quedaba sin saber
  qué había pasado. El mensaje de éxito en `(auth)/register/page.tsx`
  ahora cubre ambos casos sin delatar cuál ha ocurrido, con enlaces a
  iniciar sesión o a contacto.

- **Recuperar contraseña**: `/forgot-password` (pide email,
  `resetPasswordForEmail`, mensaje de éxito ambiguo igual que en el
  registro — no delata si el email existe) y `/reset-password` (nueva
  contraseña, `updateUser`). El link del email trae la sesión de
  recuperación en el fragmento de la URL, que solo el navegador puede
  leer — `/reset-password` es un componente cliente que instancia el
  cliente de Supabase del navegador para que la detecte y la deje en
  cookies, y así la Server Action `updatePasswordAction` (cliente de
  servidor, basado en cookies) también la vea. Enlace añadido en
  `/login`.

- **Cerrar cuenta**: nueva sección "Zona peligrosa" en el dashboard del
  cliente, con diálogo de confirmación que exige escribir "ELIMINAR". El
  borrado real (`deleteUserAccount` en `lib/supabase/admin.ts`, con
  service role) hace dos cosas: limpia en Storage las fotos de las
  mascotas del usuario y de sus visitas (no forman parte del cascade de
  la base de datos, así que quedarían huérfanas si no se borran a mano —
  se usa el cliente admin porque las fotos de visita solo son visibles
  por RLS al propio cliente cuando el informe ya está publicado, y aquí
  hace falta verlas todas), y después borra el usuario de
  `auth.users`, lo que hace cascada en BD sobre `profiles` → `pets` →
  `bookings`/`visits`/`reports`/`reviews` (ya estaba así definido desde
  la Fase 1, no hizo falta cambiar ninguna FK). El id del usuario a
  borrar sale siempre de la sesión del servidor, nunca de un parámetro
  del formulario.

- **Tono de los textos públicos: menos "generado con IA", más "tu
  cuidadora"**: la landing, su metadata/SEO y el footer dejan de decir
  explícitamente que el diario lo genera una IA y pasan a hablar de un
  diario personalizado "revisado y compartido contigo por tu cuidadora".
  Decisión consciente: sigue siendo cierto en todo momento (un informe
  nunca se autopublica, siempre lo revisa la administradora antes de
  enviarlo — ver Fase 6), solo cambia el énfasis de marketing. La
  política de privacidad (`/privacidad`) mantiene intacta la mención
  explícita a la IA, porque ahí sí es información de tratamiento de
  datos, no un mensaje de marketing, y ocultarla no sería correcto.

- **Header público consciente de la sesión**: nada bloqueaba nunca visitar
  `/` estando logueada, pero `PublicHeader` era estático y siempre
  mostraba "Iniciar sesión"/"Registrarse", incluso con sesión activa —
  inconsistente y confuso. `(public)/layout.tsx` pasa a ser un Server
  Component que consulta `getCurrentUserWithProfile()` y, si hay sesión,
  el header muestra un único botón "Ir a mi panel" (a `/dashboard` o
  `/admin/dashboard` según el rol) en vez de los botones de acceso.
  El logo de `ClientHeader`/`AdminHeader` pasa de enlazar al propio
  dashboard a enlazar siempre a `/` — la única forma de llegar a la
  landing pública estando logueada era escribir la URL a mano.

- **Foto real en el hero de la landing**: `public/pet-sitter.jpeg` (foto
  de la propia cuidadora con una mascota, no de stock). Tras varias
  pruebas de layout (foto de fondo a pantalla completa con degradado,
  descartada: la cara del perro caía justo donde iba el texto y no había
  forma de encuadrar sin tapar una cosa o la otra), se quedó en foto y
  texto en columnas separadas: apilados en móvil, en fila (foto a la
  izquierda) a partir de `md`. Se le aplica un `filter` CSS sutil
  (saturación/contraste) vía Tailwind, sin tocar el archivo original.

- **Navbar con max-width de 1440px**: el fondo/borde de
  `PublicHeader`/`ClientHeader`/`AdminHeader` sigue a todo lo ancho, pero
  su contenido (logo + navegación) queda centrado con
  `mx-auto max-w-[1440px]`, para que no se estire de más en monitores
  muy anchos.
