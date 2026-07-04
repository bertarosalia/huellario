import type { ReviewStatus } from "@/lib/constants";

export type Review = {
  id: string;
  booking_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
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
