# CLAUDE.md

Este archivo define cómo debe generarse el código en este proyecto. Claude Code debe leerlo y aplicarlo en cada tarea, sin necesidad de que se repita en cada prompt.

## Proyecto

**Huellario** — plataforma web de gestión de servicios de pet sitting a domicilio, con generación automática de diarios de visita mediante IA. TFM individual.

(Nombre provisional anterior: "PetCare Diary" — descartado por coincidir con una app real ya publicada. No usar ese nombre en código, textos ni nombres de repo/dominio.)

Flujo principal del producto:

```
Cliente se registra
→ crea mascota
→ solicita reserva
→ administradora gestiona reserva
→ administradora registra visita
→ IA genera informe (borrador)
→ administradora revisa y publica
→ cliente consulta diario
```

La funcionalidad diferencial es el diario automático con IA. Cualquier decisión técnica dudosa debe priorizar no bloquear este flujo.

## Stack técnico

| Área | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Lenguaje | TypeScript |
| UI | React |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui |
| Iconos | lucide-react |
| Formularios | React Hook Form |
| Validación | Zod |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| IA | OpenAI API (solo desde servidor) |
| Despliegue | Vercel |
| Testing | Vitest, React Testing Library, Playwright |

No propongas alternativas a este stack (ej. Prisma, NextAuth, Firebase, Redux) salvo que se pida explícitamente evaluar una alternativa.

## Arquitectura y estructura de carpetas

Arquitectura monolítica modular con Next.js full-stack. Estructura de referencia:

```
app/
  (public)/       → rutas públicas, sin auth
  (auth)/         → login, registro
  (client)/       → área privada cliente (requiere sesión)
  admin/          → panel administradora (requiere sesión + rol admin)
  api/            → rutas API (ej. api/ai/generate-report)

components/
  ui/             → componentes base (shadcn/ui)
  layout/         → header, sidebar, nav
  forms/          → patrones de formulario reutilizables
  pets/ bookings/ visits/ reports/ admin/  → componentes específicos por dominio

features/
  <dominio>/
    actions.ts    → mutaciones
    queries.ts    → lecturas
    schemas.ts    → validación Zod
    types.ts      → tipos TS del dominio

lib/
  supabase/       → client.ts, server.ts, middleware.ts
  openai/         → client.ts, generate-report.ts
  utils.ts
  constants.ts

database/
  migrations/
  seed.sql
  schema-notes.md
```

Reglas:
- Nunca mezclar lógica de negocio directamente en componentes de `app/`; va en `features/<dominio>/`.
- Componentes base reutilizables (`components/ui`) separados de componentes específicos de dominio.
- Configuración de servicios externos centralizada en `lib/`, nunca duplicada.
- Rutas agrupadas por contexto de usuario: pública, auth, cliente, admin.

## Modelo de datos (Supabase / PostgreSQL)

Tablas principales: `profiles`, `pets`, `services`, `bookings`, `visits`, `visit_photos`, `reports`, `reviews`.

- `profiles.id` coincide con el id de Supabase Auth. Roles válidos: `client`, `admin`.
- Estados controlados por texto/enum, nunca booleanos sueltos para representar estados (ej. `bookings.status`: `pending | accepted | rejected | cancelled | completed`; `reports.status`: `draft | published`).
- Checklist de cuidados de una visita se almacena en `jsonb` (`visits.care_checklist`).
- Imágenes: solo la referencia (URL/path) va en base de datos; el archivo vive en Supabase Storage.
- `reports` guarda `generated_text` (original IA) y `final_text` (editado) por separado — nunca sobrescribir el texto generado.

Al escribir queries o mutaciones, respeta las relaciones ya definidas (1→N, 1→0..1) y no las cambies sin señalarlo explícitamente.

## Seguridad (no negociable)

- Toda ruta bajo `(client)` y `admin` requiere sesión activa; `admin` requiere además rol `admin`.
- Row Level Security activo en todas las tablas con datos privados: `profiles`, `pets`, `bookings`, `visits`, `visit_photos`, `reports`, `reviews`. No propongas desactivar RLS "para simplificar".
- Un cliente solo accede a sus propios datos (mascotas, reservas, informes). Nunca construyas una query que dependa solo de un filtro en frontend para esto — el control real va en RLS/servidor.
- Claves privadas (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) solo se usan en servidor. Nunca las expongas en componentes cliente ni en variables `NEXT_PUBLIC_*`.
- La llamada a OpenAI API se hace siempre desde servidor (route handler o server action), nunca desde el navegador.
- Los informes generados por IA se crean siempre en estado `draft`. Nunca se publican automáticamente — requieren acción explícita de la administradora.
- Minimización de datos hacia la IA: solo mascota + visita + checklist + notas + incidencias. Nunca envíes email, teléfono, dirección completa u otros datos de clientes al prompt.

## Seguridad — OWASP Top 10 aplicado a este stack

Toda generación o revisión de código debe considerar estos puntos, no solo cuando se pida "seguridad" explícitamente:

**A01 Broken Access Control**
- Nunca confíes en checks de rol/propiedad solo en frontend. La autorización real vive en RLS (Supabase) y se revalida en server actions / route handlers.
- Toda query que devuelva datos de `pets`, `bookings`, `visits`, `reports`, `reviews` debe filtrar por el usuario autenticado en servidor, no confiar en que el cliente solo pida "lo suyo".
- Comprobar rol `admin` en servidor antes de ejecutar cualquier mutación de `admin/*`, no solo ocultar el enlace en la UI.

**A02 Cryptographic Failures**
- Ninguna contraseña ni secreto se gestiona manualmente: la autenticación pasa siempre por Supabase Auth.
- Nunca loguear tokens, claves de API ni contraseñas, ni siquiera en `console.log` de desarrollo.

**A03 Injection**
- Toda query a Supabase se hace con el cliente oficial (parametrizado), nunca concatenando SQL a mano.
- Todo input de usuario se valida con Zod en el servidor antes de usarse, aunque ya se haya validado en el formulario del cliente (la validación de cliente no es de fiar).
- Al construir el prompt de IA, nunca insertes texto de usuario sin sanear/acotar — evita que notas del cliente puedan reinterpretarse como instrucciones para el modelo (prompt injection).

**A04 Insecure Design**
- Los flujos sensibles (cambio de estado de reserva, publicación de informe) deben ser explícitos y auditables (quién, cuándo), no acciones implícitas.
- El informe de IA nunca se autopublica: es una decisión de diseño de seguridad, no solo de producto.

**A05 Security Misconfiguration**
- RLS activo por defecto en toda tabla nueva; si una tabla se crea sin políticas, márcalo como pendiente explícitamente, nunca lo des por "ya protegido".
- Variables de entorno separadas por entorno (local/producción); nunca reutilizar claves de producción en desarrollo.
- Cabeceras de seguridad razonables en Next.js (CSP, X-Content-Type-Options, etc.) al acercarse a Fase 10 (despliegue).

**A06 Vulnerable and Outdated Components**
- No añadir dependencias nuevas sin justificarlas; preferir las ya elegidas en el stack.
- Si se detecta una dependencia con vulnerabilidad conocida, señalarlo en vez de ignorarlo.

**A07 Identification and Authentication Failures**
- Toda ruta privada pasa por middleware/verificación de sesión de Supabase; no reinventar gestión de sesión manual.
- Cierre de sesión debe invalidar realmente el acceso a rutas protegidas (no solo redirigir).

**A08 Software and Data Integrity Failures**
- El texto generado por IA (`generated_text`) nunca se sobrescribe; se conserva junto al editado (`final_text`) para trazabilidad e integridad del histórico.

**A09 Security Logging and Monitoring Failures**
- Acciones sensibles (cambio de estado de reserva, publicación de informe, generación con IA) deben quedar registradas con fecha, para poder auditar qué pasó y cuándo.

**A10 Server-Side Request Forgery (SSRF)**
- Ninguna URL proporcionada por el usuario (ej. futura integración externa) se debe usar directamente en un `fetch` de servidor sin validar/whitelistear el dominio.

## Principios SOLID

Aplícalos de forma pragmática, no dogmática — el objetivo es mantenibilidad, no ceremonia:

- **S — Single Responsibility**: cada función/módulo hace una cosa. Separa claramente `actions.ts` (mutaciones), `queries.ts` (lecturas), `schemas.ts` (validación) y `types.ts` (tipos) por feature, tal como ya define la estructura de carpetas. Un componente de UI no debería contener lógica de acceso a datos ni construir prompts de IA directamente.
- **O — Open/Closed**: por ejemplo, el checklist de cuidados (`care_checklist`) o los estados de reserva deben poder ampliarse (nuevo tipo de cuidado, nuevo estado) sin reescribir la lógica que ya los procesa — usa estructuras de datos y switches/maps exhaustivos, no cadenas de `if` frágiles.
- **L — Liskov Substitution**: si se crean abstracciones (ej. distintos "generadores de informe" o "proveedores de storage"), cualquier implementación concreta debe poder sustituir a la interfaz sin romper el comportamiento esperado por quien la usa.
- **I — Interface Segregation**: prefiere tipos y props específicos por componente en vez de un único tipo "gigante" compartido con campos que la mayoría de consumidores no usan (ej. no pases el objeto `Pet` completo a un componente que solo necesita nombre y foto).
- **D — Dependency Inversion**: la lógica de negocio (`features/*`) no debe depender directamente del SDK de Supabase u OpenAI desnudo en todas partes; pasa por los wrappers de `lib/supabase` y `lib/openai`. Esto facilita testear con mocks y cambiar de proveedor si hiciera falta.

No fuerces SOLID donde añada complejidad innecesaria para el tamaño del MVP (ej. no crear interfaces/abstracciones especulativas para un único proveedor que no va a cambiar). Prioriza claridad sobre pureza arquitectónica.

## Integración de IA

- El prompt debe indicar explícitamente: no inventar información, no dar diagnósticos médicos, no dar recomendaciones veterinarias, usar solo el contexto proporcionado.
- Preferir Structured Outputs (JSON Schema) sobre texto libre cuando sea viable, para poder guardar título, resumen, cuerpo e incidencias por separado.
- Guardar trazabilidad: modelo usado, versión de prompt, fecha de generación.
- Cualquier función que llame a la IA debe manejar errores de generación de forma explícita (no fallar en silencio).

## Convenciones de código y estilo (preferencias personales)

- **Cambios mínimos y quirúrgicos**: al modificar código existente, cambia solo lo necesario para resolver la tarea. No reescribas ni reformatees código que no está relacionado con el cambio pedido.
- **Preserva la lógica de negocio existente** salvo que se pida explícitamente cambiarla. Si detectas un problema fuera del alcance de la tarea, señálalo aparte en vez de "arreglarlo" sin que se pida.
- **Accesibilidad nativa antes que custom**: usa elementos y atributos HTML nativos (`<button>`, `<label htmlFor>`, `<fieldset>`, `role`, `aria-*` estándar) antes de construir soluciones a medida. Evita reinventar comportamiento que el navegador ya da gratis (foco, teclado, semántica).
- Para formularios: usa `useId` de React para vincular `label`/`input` en vez de ids manuales o duplicados.
- Cuidado especial con: roving `tabindex`, `role="menu"/"menuitem"`, `aria-expanded`, `aria-controls`, gestión de foco (`setTimeout(0)` cuando haga falta esperar al render), manejo de tecla Escape en modales/dropdowns.
- No elimines `outline` / indicadores de foco visibles sin sustituirlos por un estilo de foco equivalente.
- Explica los cambios de forma concisa, con ejemplos antes/después cuando ayude a revisar rápido.
- Al trabajar de forma iterativa, asume que el código que te pego puede haber cambiado desde la última vez — no asumas el estado anterior sin confirmarlo si hay dudas.

## Documentación continua (obligatoria)

El repo debe quedar autoexplicativo, sin depender de que quien lo lea tenga acceso al Obsidian original. Cada vez que se complete una tarea relevante (una fase, una feature, una decisión técnica no trivial), hay que documentarlo dentro del propio repo, no solo entregar el código.

Dónde documentar:

- **`README.md`** — se mantiene siempre al día con: cómo levantar el proyecto en local, variables de entorno necesarias (sin valores reales), stack usado, y estado actual del MVP (qué fases están completas). Si una tarea cambia cómo se arranca o configura el proyecto, el README se actualiza en el mismo cambio, no después.
- **`docs/producto.md`** — resumen del producto, usuarios y alcance del MVP (versión resumida de lo ya definido en Obsidian).
- **`docs/arquitectura.md`** — decisiones de arquitectura y stack, y cualquier cambio respecto a lo decidido inicialmente, con la justificación.
- **`docs/modelo-datos.md`** — esquema de tablas actualizado según se vayan creando/modificando en Supabase.
- **`docs/ia.md`** — estrategia de IA, versión de prompt vigente, y un historial breve de cambios de prompt si se itera sobre él.
- **`database/schema-notes.md`** — notas puntuales sobre el esquema SQL a medida que se crean tablas o políticas RLS.

Qué documentar tras cada tarea:

- Qué se ha implementado y en qué archivos, en una o dos frases.
- Qué decisión se ha tomado si había más de una opción razonable, y por qué (igual que se hizo en Obsidian con las "Decisiones tomadas").
- Qué queda pendiente o fuera de alcance de esa tarea, si es relevante para quien continúe el trabajo.

Cómo documentar:

- Conciso, en español, coherente con el tono ya usado en la documentación de Obsidian (directo, sin relleno).
- Si una tarea afecta a una decisión ya documentada (ej. cambia un campo del modelo de datos), actualiza el documento existente en vez de añadir una nota suelta contradictoria.
- No dupliques la documentación exhaustiva de Obsidian dentro del repo: `docs/` debe ser la versión técnica resumida orientada a quien trabaja en el código, no una copia completa.
- Al cerrar cada fase del plan de desarrollo, añade una entrada breve en `README.md` (sección "Estado del proyecto" o similar) indicando qué fase se completó y la fecha.

## SEO (obligatorio en todo lo que se construya)

Toda página o ruta pública nueva debe incluir SEO desde el momento en que se crea, no como tarea aparte al final:

- **Metadata por página**: exporta `metadata` (o `generateMetadata` si depende de datos) con `title` (usando el template global de `layout.tsx`), `description` específica y `alternates.canonical`. Nunca dejar una página pública sin `title`/`description` propios.
- **Open Graph y Twitter Card**: toda ruta pública relevante debe aportar `openGraph` (y heredar `twitter` del layout si no necesita algo específico).
- **robots.ts y sitemap.ts**: cualquier ruta pública nueva y estática debe añadirse a `src/app/sitemap.ts`. Cualquier ruta privada nueva bajo `(client)` o `admin` debe quedar cubierta por `noindex` (vía metadata de su layout) y por el `disallow` de `src/app/robots.ts` — nunca debe indexarse una URL con datos de usuario.
- **Datos estructurados (JSON-LD)**: cuando la página represente una entidad con equivalente en schema.org (servicio, negocio local, FAQ, reseña pública), añade el JSON-LD correspondiente, siguiendo el patrón ya usado en `(public)/page.tsx`.
- **HTML semántico**: un único `<h1>` por página, jerarquía de encabezados coherente, `alt` descriptivo en imágenes de contenido (no decorativas).
- Al añadir `NEXT_PUBLIC_SITE_URL` u otras variables relacionadas con SEO, documenta el valor esperado en `.env.example` y en el README, igual que cualquier otra variable de entorno.

No se autopublica el SEO igual que no se autopublican los informes de IA: si una página nueva no encaja claramente en indexable/no indexable, señálalo explícitamente en vez de asumir un valor por defecto.

## Testing

Prioriza tests en flujos críticos, no cobertura exhaustiva:
- Validaciones de formularios.
- Permisos de acceso (cliente vs admin, propiedad de datos).
- Creación de mascota, solicitud de reserva.
- Generación y publicación de informes.
- Consulta privada de informes (que un cliente no vea datos de otro).

## Fuera de alcance del MVP (no implementar salvo que se pida explícitamente)

Pagos online, chat en tiempo real, app móvil nativa, geolocalización/tracking GPS, notificaciones push, sistema multi-cuidador, facturación. Si una tarea parece requerir alguna de estas, avisa antes de implementarla.
