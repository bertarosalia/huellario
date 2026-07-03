"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";
import { bookingFormSchema, type BookingFormInput } from "./schemas";

export type BookingActionState = {
  error?: string;
};

function readForm(formData: FormData): BookingFormInput {
  return {
    petId: String(formData.get("petId") ?? ""),
    serviceId: String(formData.get("serviceId") ?? ""),
    requestedDate: String(formData.get("requestedDate") ?? ""),
    requestedTime: String(formData.get("requestedTime") ?? ""),
    address: String(formData.get("address") ?? ""),
    clientNotes: String(formData.get("clientNotes") ?? ""),
  };
}

export async function createBookingAction(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = bookingFormSchema.safeParse(readForm(formData));
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
  const { error } = await supabase.from("bookings").insert({
    client_id: user.id,
    pet_id: data.petId,
    service_id: data.serviceId,
    requested_date: data.requestedDate,
    requested_time: data.requestedTime,
    address: data.address || null,
    client_notes: data.clientNotes || null,
  });

  if (error) {
    return { error: "No se pudo enviar la solicitud de reserva" };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error("Estado de reserva no válido");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);

  if (error) {
    throw new Error("No se pudo actualizar el estado de la reserva");
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/bookings");
}
