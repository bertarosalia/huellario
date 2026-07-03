# Modelo de datos

Ver [`database/schema-notes.md`](../database/schema-notes.md) para el
detalle de tablas, relaciones y estado de implementación (aún sin crear en
Supabase).

Resumen de entidades: `profiles`, `pets`, `services`, `bookings`, `visits`,
`visit_photos`, `reports`, `reviews`. Relaciones 1→N salvo `visits→reports`
y `bookings→reviews`, que son 1→0..1.

Detalle completo del modelo conceptual y lógico: Obsidian
`4. Modelos-de-datos/`.
