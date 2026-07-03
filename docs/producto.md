# Producto

Huellario es una plataforma web para gestionar servicios de pet sitting a
domicilio. Su funcionalidad diferencial es la generación automática de
diarios de visita mediante IA, revisados y publicados por la administradora
antes de que el cliente pueda verlos.

## Flujo principal

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

## Roles

- **Visitante no registrado**: solo accede a la parte pública.
- **Cliente**: gestiona sus mascotas, solicita reservas, consulta informes
  publicados de sus mascotas y puede dejar reseñas.
- **Administradora / pet sitter**: gestiona reservas, registra visitas,
  genera y publica informes.

## Alcance del MVP

Imprescindible: autenticación, gestión de mascotas, reservas, registro de
visitas, generación y publicación de informes con IA, consulta privada de
informes.

Deseable (no bloqueante): fotos de visita, reseñas verificadas, filtros
avanzados en el panel admin.

Fuera de alcance: pagos online, chat en tiempo real, app móvil nativa,
geolocalización, notificaciones push, multi-cuidador, facturación.

Detalle completo: Obsidian `1. Producto/`, `2. Usuarios-y-casos-de-uso/`,
`3. Funcionalidades/`.
