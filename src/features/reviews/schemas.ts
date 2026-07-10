import { z } from "zod";

export const reviewFormSchema = z.object({
  bookingId: z.string().trim().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().optional().or(z.literal("")),
  showPetPhoto: z.boolean().default(false),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
