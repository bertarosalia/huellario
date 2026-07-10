import type { ReviewStatus } from "@/lib/constants";

export type Review = {
  id: string;
  booking_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  show_pet_photo: boolean;
  created_at: string;
  updated_at: string;
};

export type ReviewWithRelations = Review & {
  bookings: {
    requested_date: string;
    pets: { name: string } | null;
    services: { name: string } | null;
  } | null;
  profiles: { full_name: string | null } | null;
};

// Fila devuelta por la función get_published_reviews_public (RPC): son los
// únicos campos seguros para un visitante anónimo, sin datos de cliente ni
// de mascota más allá de la foto cuando el dueño ha dado su consentimiento.
export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  pet_photo_path: string | null;
};
