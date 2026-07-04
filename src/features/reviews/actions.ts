"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReviewStatus } from "@/lib/constants";
import { reviewFormSchema } from "./schemas";

export type ReviewActionState = {
  error?: string;
};

export async function createReviewAction(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewFormSchema.safeParse({
    bookingId: String(formData.get("bookingId") ?? ""),
    rating: formData.get("rating"),
    comment: String(formData.get("comment") ?? ""),
  });

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
  const { error } = await supabase.from("reviews").insert({
    booking_id: data.bookingId,
    client_id: user.id,
    rating: data.rating,
    comment: data.comment || null,
  });

  if (error) {
    return { error: "No se pudo guardar la reseña" };
  }

  revalidatePath(`/bookings/${data.bookingId}`);
  return {};
}

export async function moderateReviewAction(reviewId: string, status: ReviewStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);

  if (error) {
    throw new Error("No se pudo actualizar la reseña");
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
