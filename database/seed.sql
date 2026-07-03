-- Huellario — datos iniciales de desarrollo.
-- Aplicar después de 0001_init.sql en el SQL Editor de Supabase.

insert into public.services (name, description, duration_minutes, is_active) values
  ('Visita a domicilio', 'Visita breve para alimentar, revisar agua, limpiar zona y acompañar a la mascota.', 30, true),
  ('Paseo', 'Paseo individual adaptado al ritmo y necesidades de la mascota.', 45, true),
  ('Cuidado prolongado', 'Servicio de acompañamiento más largo en el domicilio.', 120, true),
  ('Cuidado con medicación', 'Visita que incluye administración de medicación indicada por el propietario.', 30, true);
