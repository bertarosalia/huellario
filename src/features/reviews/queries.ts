import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ReviewWithRelations } from "./types";

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

// Para la web pública: RLS permite leer reseñas publicadas a cualquiera
// (autenticado o no), pero sin unir profiles/pets/bookings — esas tablas
// no son visibles para un visitante anónimo, y además el propio alcance
// funcional pide explícitamente no mostrar datos privados de clientes ni
// mascotas en la vista pública de reseñas.
export async function getPublishedReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
