import { z } from "zod";

export const visitFormSchema = z.object({
  bookingId: z.string().trim().uuid(),
  visitedDate: z.string().trim().min(1, "Indica la fecha de la visita"),
  visitedTime: z.string().trim().min(1, "Indica la hora de la visita"),
  durationMinutes: z.string().trim().optional().or(z.literal("")),
  mood: z.string().trim().optional().or(z.literal("")),
  ate: z.boolean(),
  drankWater: z.boolean(),
  walked: z.boolean(),
  played: z.boolean(),
  medicationGiven: z.boolean(),
  bathroomOk: z.boolean(),
  cleanedArea: z.boolean(),
  quickNotes: z.string().trim().optional().or(z.literal("")),
  incidents: z.string().trim().optional().or(z.literal("")),
});

export type VisitFormInput = z.infer<typeof visitFormSchema>;

export const CHECKLIST_ITEMS: Array<{ key: keyof VisitFormInput; label: string }> = [
  { key: "ate", label: "Ha comido" },
  { key: "drankWater", label: "Ha bebido agua" },
  { key: "walked", label: "Ha paseado" },
  { key: "played", label: "Ha jugado" },
  { key: "medicationGiven", label: "Ha tomado medicación" },
  { key: "bathroomOk", label: "Ha hecho sus necesidades" },
  { key: "cleanedArea", label: "Se ha limpiado su zona" },
];
