import "server-only";
import { createClient } from "@supabase/supabase-js";
import { PHOTOS_BUCKET } from "./storage";

// Usos permitidos de la service role key, cada uno acotado a una función
// concreta — no usar este cliente para nada más:
// - resolver el email de un usuario a partir de su id (auth.users.email
//   no está duplicado en profiles);
// - borrar la cuenta de un usuario (auth.admin.deleteUser requiere
//   service role; no existe otra vía).
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await adminClient.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

// Borra las fotos del usuario en Storage y su cuenta de Auth. El borrado
// del usuario en auth.users hace cascada en BD sobre profiles → pets →
// bookings/visits/reports/reviews (ver migrations/0001_init.sql), pero
// los objetos de Storage no forman parte de esa cascada — hay que
// borrarlos aparte, antes de que las filas que los referencian
// desaparezcan. Se usa el cliente admin (no el del usuario) porque las
// fotos de visita solo son visibles por RLS al cliente cuando el informe
// ya está publicado, y aquí hace falta ver todas, publicadas o no.
export async function deleteUserAccount(userId: string): Promise<void> {
  const { data: pets } = await adminClient
    .from("pets")
    .select("id, main_photo_url")
    .eq("owner_id", userId);

  const petIds = (pets ?? []).map((pet) => pet.id);
  const petPhotoPaths = (pets ?? [])
    .map((pet) => pet.main_photo_url)
    .filter((path): path is string => Boolean(path));

  let visitPhotoPaths: string[] = [];
  if (petIds.length > 0) {
    const { data: visitPhotos } = await adminClient
      .from("visit_photos")
      .select("storage_path")
      .in("pet_id", petIds);
    visitPhotoPaths = (visitPhotos ?? []).map((photo) => photo.storage_path);
  }

  const allPaths = [...petPhotoPaths, ...visitPhotoPaths];
  if (allPaths.length > 0) {
    await adminClient.storage.from(PHOTOS_BUCKET).remove(allPaths);
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error("No se pudo eliminar la cuenta");
  }
}
