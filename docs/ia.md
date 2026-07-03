# Estrategia de IA

## Objetivo

Generar un borrador de diario de visita a partir de datos de mascota,
reserva, visita, checklist de cuidados, notas rápidas e incidencias. La IA
nunca publica directamente: el informe se crea siempre en estado `draft` y
requiere revisión y publicación explícita de la administradora.

## Reglas del prompt

- No inventar información no proporcionada.
- No dar diagnósticos médicos ni recomendaciones veterinarias.
- Tono cercano, profesional, sin dramatizar incidencias.
- Minimización de datos: solo mascota + visita + checklist + notas +
  incidencias. Nunca email, teléfono ni dirección completa del cliente.

## Salida esperada

Preferir Structured Outputs (JSON Schema) sobre texto libre:

```json
{
  "title": "string",
  "summary": "string",
  "story": "string",
  "care_summary": "string",
  "incidents": "string",
  "owner_message": "string"
}
```

## Trazabilidad

Se guarda junto al informe: `generated_text` (original, nunca se sobrescribe),
`final_text` (editado), modelo usado, versión de prompt, fecha de
generación y de publicación.

## Proveedor

Google Gemini API (`@google/genai`), no OpenAI. Se decidió el cambio en la
Fase 6: OpenAI exige método de pago activo incluso para uso mínimo, y
Gemini ofrece tier gratuito sin tarjeta. La arquitectura de la integración
(servidor únicamente, Structured Outputs, minimización de datos, borrador
nunca autopublicado) es la misma; solo cambia el SDK y el nombre de la
variable de entorno (`GEMINI_API_KEY` en vez de `OPENAI_API_KEY`).

## Estado actual (Fase 6 — implementada)

- `src/lib/ai/generate-report.ts`: construye el prompt (system instruction +
  contexto minimizado de mascota/visita), llama a
  `ai.models.generateContent` con Structured Outputs
  (`responseMimeType: "application/json"` + `responseJsonSchema`) y
  devuelve el JSON tipado. Modelo configurable vía `GEMINI_MODEL`
  (por defecto `gemini-2.5-flash`).
- `src/features/reports/actions.ts`: `generateReportAction` — obtiene
  visita + mascota, llama a la IA (con manejo explícito de errores, nunca
  falla en silencio), guarda el resultado en `reports` con `status: draft`.
  Si ya existe un informe para esa visita, redirige a editarlo en vez de
  duplicar (la tabla tiene `visit_id` único).
- `updateReportFinalTextAction` / `publishReportAction`: edición y
  publicación explícita, solo administradora (RLS).

### Decisión: una sola columna de texto en vez de campos estructurados

Aunque se pide salida estructurada (title, summary, story, care_summary,
incidents, owner_message) a la IA, el resultado se serializa en un único
texto formateado (`formatReportText`) antes de guardarlo en
`generated_text`/`final_text`, en vez de añadir columnas nuevas a `reports`.

Motivo: el esquema de `reports` ya estaba migrado con dos columnas de texto
(Fase 1); separar los campos habría requerido una migración adicional no
prevista. Para el MVP, el editor de la administradora trabaja sobre el
texto ya formateado. Si más adelante se necesita mostrar el informe por
secciones en la interfaz del cliente, se puede ampliar el esquema entonces.

## Historial de versiones de prompt

- **v1** (Fase 6): prompt inicial descrito arriba, sin cambios posteriores
  todavía.
