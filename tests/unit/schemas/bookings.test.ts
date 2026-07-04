import { describe, expect, it } from "vitest";
import { bookingFormSchema } from "@/features/bookings/schemas";

const VALID = {
  petId: "2c73046e-fd10-4c2b-8edd-5c8fc35b7280",
  serviceId: "2cdbaae4-acfc-4e0f-93d8-77a42c294f93",
  requestedDate: "2026-08-01",
  requestedTime: "10:00",
};

describe("bookingFormSchema", () => {
  it("acepta una solicitud válida", () => {
    expect(bookingFormSchema.safeParse(VALID).success).toBe(true);
  });

  it("rechaza petId que no sea un uuid", () => {
    expect(bookingFormSchema.safeParse({ ...VALID, petId: "no-uuid" }).success).toBe(false);
  });

  it("rechaza serviceId que no sea un uuid", () => {
    expect(bookingFormSchema.safeParse({ ...VALID, serviceId: "no-uuid" }).success).toBe(false);
  });

  it("rechaza sin fecha", () => {
    expect(bookingFormSchema.safeParse({ ...VALID, requestedDate: "" }).success).toBe(false);
  });

  it("rechaza sin hora", () => {
    expect(bookingFormSchema.safeParse({ ...VALID, requestedTime: "" }).success).toBe(false);
  });

  it("acepta dirección y notas opcionales", () => {
    const result = bookingFormSchema.safeParse({
      ...VALID,
      address: "Calle Falsa 123",
      clientNotes: "Tiene la llave el vecino",
    });
    expect(result.success).toBe(true);
  });
});
