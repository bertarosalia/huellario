import "server-only";
import { Resend } from "resend";

export const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

let resendClient: Resend | null = null;

// Instanciación perezosa: el constructor de Resend lanza si la API key
// está vacía, y queremos que la app funcione igual sin ella configurada
// (el envío de email es un efecto secundario, nunca debe romper la página).
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
