"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { visitFormSchema, type VisitFormInput } from "./schemas";

export type VisitActionState = {
  error?: string;
};

function readForm(formData: FormData): VisitFormInput {
  return {
    bookingId: String(formData.get("bookingId") ?? ""),
    visitedDate: String(formData.get("visitedDate") ?? ""),
    visitedTime: String(formData.get("visitedTime") ?? ""),
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
    mood: String(formData.get("mood") ?? ""),
    ate: formData.get("ate") === "true",
    drankWater: formData.get("drankWater") === "true",
    walked: formData.get("walked") === "true",
    played: formData.get("played") === "true",
    medicationGiven: formData.get("medicationGiven") === "true",
    bathroomOk: formData.get("bathroomOk") === "true",
    cleanedArea: formData.get("cleanedArea") === "true",
    quickNotes: String(formData.get("quickNotes") ?? ""),
    incidents: String(formData.get("incidents") ?? ""),
  };
}

export async function createVisitAction(
  _prevState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const parsed = visitFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión" };
  }

  const { data } = parsed;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, pet_id, status")
    .eq("id", data.bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return { error: "La reserva no existe" };
  }

  if (booking.status !== "accepted" && booking.status !== "completed") {
    return { error: "Solo se pueden registrar visitas de reservas aceptadas o completadas" };
  }

  const { error } = await supabase.from("visits").insert({
    booking_id: data.bookingId,
    pet_id: booking.pet_id,
    visited_at: new Date(`${data.visitedDate}T${data.visitedTime}`).toISOString(),
    duration_minutes: data.durationMinutes ? Number(data.durationMinutes) : null,
    mood: data.mood || null,
    care_checklist: {
      ate: data.ate,
      drank_water: data.drankWater,
      walked: data.walked,
      played: data.played,
      medication_given: data.medicationGiven,
      bathroom_ok: data.bathroomOk,
      cleaned_area: data.cleanedArea,
    },
    quick_notes: data.quickNotes || null,
    incidents: data.incidents || null,
    created_by: user.id,
  });

  if (error) {
    return { error: "No se pudo guardar la visita" };
  }

  revalidatePath(`/admin/bookings/${data.bookingId}`);
  redirect(`/admin/bookings/${data.bookingId}`);
}
