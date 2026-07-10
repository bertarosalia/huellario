import type { BookingStatus } from "@/lib/constants";

export type Booking = {
  id: string;
  client_id: string;
  pet_id: string;
  service_id: string;
  requested_date: string;
  requested_time: string;
  address: string | null;
  client_notes: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  price_cents: number | null;
  is_active: boolean;
};

export type BookingWithRelations = Booking & {
  pets: {
    name: string;
    species: string;
    breed: string | null;
    medical_info: string | null;
    medication: string | null;
    vet_contact: string | null;
    behavior_notes: string | null;
    energy_level: string | null;
    fears_triggers: string | null;
    special_needs: string | null;
    main_photo_url: string | null;
  } | null;
  services: { name: string; duration_minutes: number | null } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
};
