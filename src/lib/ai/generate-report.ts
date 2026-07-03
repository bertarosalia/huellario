import "server-only";
import { ai } from "./client";
import type { Pet } from "@/features/pets/types";
import type { Visit } from "@/features/visits/types";

export const PROMPT_VERSION = "v1";
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export type GeneratedReport = {
  title: string;
  summary: string;
  story: string;
  careSummary: string;
  incidents: string;
  ownerMessage: string;
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título breve del diario de la visita" },
    summary: { type: "string", description: "Resumen de una o dos frases" },
    story: { type: "string", description: "Informe narrativo de la visita" },
    care_summary: { type: "string", description: "Resumen de los cuidados realizados" },
    incidents: {
      type: "string",
      description: "Incidencias observadas, o indicar que no hubo ninguna",
    },
    owner_message: { type: "string", description: "Mensaje final cercano para el propietario" },
  },
  required: ["title", "summary", "story", "care_summary", "incidents", "owner_message"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `Eres un asistente de redacción para una cuidadora de mascotas a domicilio.

Tu tarea es generar un borrador de diario de visita para el propietario de la mascota.

Debes escribir en español, con un tono cercano, profesional, tranquilo y emocionalmente cuidado.

Usa únicamente la información proporcionada en el contexto. No inventes datos, actividades, síntomas, comportamientos ni incidencias que no aparezcan en el contexto.

No realices diagnósticos médicos ni recomendaciones veterinarias. Si hay una incidencia médica registrada, menciónala de forma descriptiva, sin interpretarla clínicamente.

El informe debe ser claro, natural y fácil de leer para el propietario.`;

function buildCareChecklistText(checklist: Visit["care_checklist"]) {
  const labels: Record<keyof Visit["care_checklist"], string> = {
    ate: "Ha comido",
    drank_water: "Ha bebido agua",
    walked: "Ha paseado",
    played: "Ha jugado",
    medication_given: "Ha tomado medicación",
    bathroom_ok: "Ha hecho sus necesidades",
    cleaned_area: "Se ha limpiado su zona",
  };

  return Object.entries(labels)
    .map(([key, label]) => `- ${label}: ${checklist[key as keyof Visit["care_checklist"]] ? "sí" : "no"}`)
    .join("\n");
}

function buildUserPrompt(pet: Pet, visit: Visit) {
  const petContext = [
    `Nombre: ${pet.name}`,
    `Especie: ${pet.species}`,
    pet.breed ? `Raza: ${pet.breed}` : null,
    pet.behavior_notes ? `Comportamiento habitual: ${pet.behavior_notes}` : null,
    pet.energy_level ? `Nivel de energía: ${pet.energy_level}` : null,
    pet.fears_triggers ? `Miedos o desencadenantes: ${pet.fears_triggers}` : null,
    pet.special_needs ? `Necesidades especiales: ${pet.special_needs}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Datos de la mascota:
${petContext}

Datos de la visita:
Estado general observado: ${visit.mood ?? "no indicado"}
Duración: ${visit.duration_minutes ? `${visit.duration_minutes} minutos` : "no indicada"}

Checklist de cuidados:
${buildCareChecklistText(visit.care_checklist)}

Notas de la cuidadora:
${visit.quick_notes || "(sin notas adicionales)"}

Incidencias:
${visit.incidents || "(no se han registrado incidencias)"}`;
}

export async function generateVisitReport(pet: Pet, visit: Visit): Promise<GeneratedReport> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserPrompt(pet, visit),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Respuesta vacía de la IA");
  }

  const parsed = JSON.parse(text) as {
    title: string;
    summary: string;
    story: string;
    care_summary: string;
    incidents: string;
    owner_message: string;
  };

  return {
    title: parsed.title,
    summary: parsed.summary,
    story: parsed.story,
    careSummary: parsed.care_summary,
    incidents: parsed.incidents,
    ownerMessage: parsed.owner_message,
  };
}

export function formatReportText(report: GeneratedReport) {
  return `# ${report.title}

${report.summary}

${report.story}

**Cuidados realizados**
${report.careSummary}

**Incidencias**
${report.incidents}

${report.ownerMessage}`;
}
