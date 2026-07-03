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

## Estado actual (Sprint 0)

`src/lib/openai/client.ts` creado (cliente inicializado, protegido con
`server-only`). La función de generación (`generate-report.ts`) y el prompt
concreto se implementan en la Fase 6, cuando exista el registro de visitas
del que depender.

## Historial de versiones de prompt

Aún no hay versión implementada. Borrador de referencia en Obsidian
`6. IA/Estrategia-de-IA.md`.
