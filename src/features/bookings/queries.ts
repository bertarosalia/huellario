import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Booking, BookingWithRelations, Service } from "./types";

const BOOKING_RELATIONS_SELECT = `
  *,
  pets (
    name, species, breed, medical_info, medication, vet_contact,
    behavior_notes, energy_level, fears_triggers, special_needs
  ),
  services ( name, duration_minutes ),
  profiles ( full_name, phone )
`;

export async function getActiveServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .returns<Service[]>();

  if (error) throw error;
  return data;
}

export async function getBookingsForCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_RELATIONS_SELECT)
    .order("created_at", { ascending: false })
    .returns<BookingWithRelations[]>();

  if (error) throw error;
  return data;
}

export async function getAllBookings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_RELATIONS_SELECT)
    .order("created_at", { ascending: false })
    .returns<BookingWithRelations[]>();

  if (error) throw error;
  return data;
}

export async function getBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle<BookingWithRelations>();

  if (error) throw error;
  return data;
}

export type { Booking };
