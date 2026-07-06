"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/supabase/admin";
import { sendBookingResolvedNotification, sendNewBookingNotifications } from "@/lib/email/send";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";
import { bookingFormSchema, type BookingFormInput } from "./schemas";
import type { Booking } from "./types";

const BOOKING_RELATIONS_SELECT = `
  *,
  pets ( name ),
  services ( name )
`;

type BookingWithNames = Booking & {
  pets: { name: string } | null;
  services: { name: string } | null;
};

function toBookingEmailInfo(booking: BookingWithNames, clientName: string) {
  return {
    petName: booking.pets?.name ?? "tu mascota",
    serviceName: booking.services?.name ?? "el servicio",
    requestedDate: booking.requested_date,
    requestedTime: booking.requested_time.slice(0, 5),
    clientName,
    clientNotes: booking.client_notes,
  };
}

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
  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      pet_id: data.petId,
      service_id: data.serviceId,
      requested_date: data.requestedDate,
      requested_time: data.requestedTime,
      address: data.address || null,
      client_notes: data.clientNotes || null,
    })
    .select(BOOKING_RELATIONS_SELECT)
    .single<BookingWithNames>();

  if (error) {
    return { error: "No se pudo enviar la solicitud de reserva" };
  }

  if (user.email) {
    const clientName = (user.user_metadata?.full_name as string | undefined) ?? "Cliente";
    await sendNewBookingNotifications(toBookingEmailInfo(inserted, clientName), user.email);
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error("Estado de reserva no válido");
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select(BOOKING_RELATIONS_SELECT)
    .single<BookingWithNames>();

  if (error) {
    throw new Error("No se pudo actualizar el estado de la reserva");
  }

  const clientEmail = await getUserEmail(updated.client_id);
  if (clientEmail) {
    await sendBookingResolvedNotification(toBookingEmailInfo(updated, "Cliente"), status, clientEmail);
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/bookings");
}
