import { z } from "zod";

export const petFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  species: z.string().trim().min(1, "La especie es obligatoria"),
  breed: z.string().trim().optional().or(z.literal("")),
  birthDate: z.string().trim().optional().or(z.literal("")),
  sex: z.string().trim().optional().or(z.literal("")),
  feedingRoutine: z.string().trim().optional().or(z.literal("")),
  medicalInfo: z.string().trim().optional().or(z.literal("")),
  medication: z.string().trim().optional().or(z.literal("")),
  vetContact: z.string().trim().optional().or(z.literal("")),
  behaviorNotes: z.string().trim().optional().or(z.literal("")),
  energyLevel: z.string().trim().optional().or(z.literal("")),
  fearsTriggers: z.string().trim().optional().or(z.literal("")),
  specialNeeds: z.string().trim().optional().or(z.literal("")),
  additionalNotes: z.string().trim().optional().or(z.literal("")),
});

export type PetFormInput = z.infer<typeof petFormSchema>;
