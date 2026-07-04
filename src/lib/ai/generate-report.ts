import "server-only";
import { ai } from "./client";
import { RESPONSE_SCHEMA, SYSTEM_PROMPT, buildUserPrompt, type GeneratedReport } from "./prompt";
import type { Pet } from "@/features/pets/types";
import type { Visit } from "@/features/visits/types";

export const PROMPT_VERSION = "v1";
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export type { GeneratedReport };
export { formatReportText } from "./prompt";

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
