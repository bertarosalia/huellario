import "server-only";
import { createClient } from "./server";

export const PHOTOS_BUCKET = "photos";
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return "Formato de imagen no permitido. Usa JPG, PNG o WEBP.";
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return null;
}

export async function getSignedPhotoUrl(path: string, expiresInSeconds = 3600) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) return null;
  return data.signedUrl;
}

export async function getSignedPhotoUrls(paths: string[], expiresInSeconds = 3600) {
  if (paths.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrls(paths, expiresInSeconds);

  if (error || !data) return [];
  return data.map((entry) => entry.signedUrl).filter((url): url is string => Boolean(url));
}
