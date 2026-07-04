import { describe, expect, it } from "vitest";
import { buildUserPrompt, formatReportText } from "@/lib/ai/prompt";
import type { Pet } from "@/features/pets/types";
import type { Visit } from "@/features/visits/types";

const PET: Pet = {
  id: "pet-1",
  owner_id: "owner-1",
  name: "Luna",
  species: "Perro",
  breed: "Golden Retriever",
  birth_date: null,
  sex: null,
  main_photo_url: null,
  feeding_routine: null,
  medical_info: "Alergia leve a algunos pienso",
  medication: null,
  vet_contact: "Clínica Central, 600123456",
  behavior_notes: "Muy sociable",
  energy_level: "Alta",
  fears_triggers: "Truenos",
  special_needs: null,
  additional_notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const VISIT: Visit = {
  id: "visit-1",
  booking_id: "booking-1",
  pet_id: "pet-1",
  visited_at: "2026-08-01T10:00:00.000Z",
  duration_minutes: 45,
  mood: "Contenta",
  care_checklist: {
    ate: true,
    drank_water: true,
    walked: true,
    played: false,
    medication_given: false,
    bathroom_ok: false,
    cleaned_area: false,
  },
  quick_notes: "Ha caminado muy bien",
  incidents: "",
  created_by: "admin-1",
  created_at: "2026-08-01T10:00:00.000Z",
  updated_at: "2026-08-01T10:00:00.000Z",
};

// Datos de cliente que NUNCA deben llegar al prompt (minimización, CLAUDE.md).
const FORBIDDEN_STRINGS = [
  "bertafloran@gmail.com",
  "+34600000000",
  "Calle Falsa 123",
  "owner-1", // el id del propietario tampoco debería filtrarse al texto libre
];

describe("buildUserPrompt", () => {
  const prompt = buildUserPrompt(PET, VISIT);

  it("incluye los datos relevantes de la mascota y la visita", () => {
    expect(prompt).toContain("Luna");
    expect(prompt).toContain("Golden Retriever");
    expect(prompt).toContain("Muy sociable");
    expect(prompt).toContain("Contenta");
    expect(prompt).toContain("Ha caminado muy bien");
  });

  it("refleja el checklist de cuidados marcado", () => {
    expect(prompt).toContain("Ha comido: sí");
    expect(prompt).toContain("Ha paseado: sí");
    expect(prompt).toContain("Ha jugado: no");
  });

  it("indica explícitamente cuando no hay incidencias", () => {
    expect(prompt).toContain("no se han registrado incidencias");
  });

  it("nunca incluye datos de contacto del cliente (minimización)", () => {
    for (const forbidden of FORBIDDEN_STRINGS) {
      expect(prompt).not.toContain(forbidden);
    }
  });
});

describe("formatReportText", () => {
  it("combina todas las secciones del informe generado", () => {
    const text = formatReportText({
      title: "Un paseo tranquilo",
      summary: "Luna ha estado feliz",
      story: "Hoy Luna ha disfrutado de un buen paseo.",
      careSummary: "Ha comido y bebido agua.",
      incidents: "No se han registrado incidencias.",
      ownerMessage: "¡Hasta la próxima visita!",
    });

    expect(text).toContain("# Un paseo tranquilo");
    expect(text).toContain("Luna ha estado feliz");
    expect(text).toContain("Hoy Luna ha disfrutado de un buen paseo.");
    expect(text).toContain("Ha comido y bebido agua.");
    expect(text).toContain("No se han registrado incidencias.");
    expect(text).toContain("¡Hasta la próxima visita!");
  });
});
