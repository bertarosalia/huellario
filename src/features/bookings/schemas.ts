import { z } from "zod";

export const bookingFormSchema = z.object({
  petId: z.string().trim().uuid("Selecciona una mascota"),
  serviceId: z.string().trim().uuid("Selecciona un servicio"),
  requestedDate: z.string().trim().min(1, "Indica una fecha"),
  requestedTime: z.string().trim().min(1, "Indica una hora"),
  address: z.string().trim().optional().or(z.literal("")),
  clientNotes: z.string().trim().optional().or(z.literal("")),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
