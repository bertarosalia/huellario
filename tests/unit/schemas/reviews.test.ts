import { describe, expect, it } from "vitest";
import { reviewFormSchema } from "@/features/reviews/schemas";

const VALID = {
  bookingId: "6678886f-108f-4b08-8015-5e610ca4d39c",
  rating: 5,
  comment: "Genial",
};

describe("reviewFormSchema", () => {
  it("acepta una reseña válida", () => {
    expect(reviewFormSchema.safeParse(VALID).success).toBe(true);
  });

  it("acepta sin comentario", () => {
    expect(reviewFormSchema.safeParse({ ...VALID, comment: "" }).success).toBe(true);
  });

  it("rechaza puntuación fuera de 1-5", () => {
    expect(reviewFormSchema.safeParse({ ...VALID, rating: 0 }).success).toBe(false);
    expect(reviewFormSchema.safeParse({ ...VALID, rating: 6 }).success).toBe(false);
  });

  it("rechaza puntuación no entera", () => {
    expect(reviewFormSchema.safeParse({ ...VALID, rating: 3.5 }).success).toBe(false);
  });

  it("rechaza bookingId inválido", () => {
    expect(reviewFormSchema.safeParse({ ...VALID, bookingId: "no-uuid" }).success).toBe(false);
  });

  it("showPetPhoto por defecto es false si no se envía", () => {
    const result = reviewFormSchema.safeParse(VALID);
    expect(result.success && result.data.showPetPhoto).toBe(false);
  });

  it("acepta showPetPhoto true", () => {
    const result = reviewFormSchema.safeParse({ ...VALID, showPetPhoto: true });
    expect(result.success && result.data.showPetPhoto).toBe(true);
  });
});
