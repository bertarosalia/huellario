import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Introduce tu nombre completo"),
    phone: z.string().trim().optional().or(z.literal("")),
    email: z.string().trim().email("Introduce un email válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;
