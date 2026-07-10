import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PublicReview, ReviewWithRelations } from "./types";

const REVIEW_RELATIONS_SELECT = `
  *,
  bookings ( requested_date, pets ( name ), services ( name ) ),
  profiles ( full_name )
`;

export async function getReviewByBookingId(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_RELATIONS_SELECT)
    .eq("booking_id", bookingId)
    .maybeSingle<ReviewWithRelations>();

  if (error) throw error;
  return data;
}

export async function getAllReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_RELATIONS_SELECT)
    .order("created_at", { ascending: false })
    .returns<ReviewWithRelations[]>();

  if (error) throw error;
  return data;
}

// Para la web pública: nunca se consulta `reviews`/`bookings`/`pets`
// directamente (esas tablas no son visibles para un visitante anónimo, y
// el alcance funcional pide explícitamente no mostrar datos privados de
// clientes ni mascotas). En su lugar se llama a la función
// get_published_reviews_public (SECURITY DEFINER, ver
// database/migrations/0003_review_pet_photo.sql), que expone solo los
// campos seguros — incluida la ruta de la foto de mascota, y solo cuando
// el dueño ha dado su consentimiento explícito al dejar la reseña.
export async function getPublishedReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_reviews_public");

  if (error) throw error;
  return (data ?? []) as PublicReview[];
}
