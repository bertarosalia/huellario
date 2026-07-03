import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { VisitWithRelations } from "./types";

export async function getVisitById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*, pets ( name, species ), bookings ( requested_date, requested_time )")
    .eq("id", id)
    .maybeSingle<VisitWithRelations>();

  if (error) throw error;
  return data;
}

export async function getVisitByBookingId(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*, pets ( name, species ), bookings ( requested_date, requested_time )")
    .eq("booking_id", bookingId)
    .maybeSingle<VisitWithRelations>();

  if (error) throw error;
  return data;
}
