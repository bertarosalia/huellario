import { describe, expect, it } from "vitest";
import { visitFormSchema, CHECKLIST_ITEMS } from "@/features/visits/schemas";

const VALID = {
  bookingId: "6678886f-108f-4b08-8015-5e610ca4d39c",
  visitedDate: "2026-08-01",
  visitedTime: "10:00",
  durationMinutes: "45",
  mood: "Tranquila",
  ate: true,
  drankWater: true,
  walked: true,
  played: false,
  medicationGiven: false,
  bathroomOk: false,
  cleanedArea: false,
  quickNotes: "Todo bien",
  incidents: "",
};

describe("visitFormSchema", () => {
  it("acepta una visita válida", () => {
    expect(visitFormSchema.safeParse(VALID).success).toBe(true);
  });

  it("rechaza bookingId inválido", () => {
    expect(visitFormSchema.safeParse({ ...VALID, bookingId: "no-uuid" }).success).toBe(false);
  });

  it("rechaza sin fecha ni hora", () => {
    expect(
      visitFormSchema.safeParse({ ...VALID, visitedDate: "", visitedTime: "" }).success,
    ).toBe(false);
  });

  it("el checklist tiene los 7 cuidados esperados", () => {
    expect(CHECKLIST_ITEMS).toHaveLength(7);
    expect(CHECKLIST_ITEMS.map((i) => i.key)).toEqual([
      "ate",
      "drankWater",
      "walked",
      "played",
      "medicationGiven",
      "bathroomOk",
      "cleanedArea",
    ]);
  });
});
