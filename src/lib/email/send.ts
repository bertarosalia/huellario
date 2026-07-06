import "server-only";
import { ADMIN_EMAIL, EMAIL_FROM, getResendClient } from "./client";
import {
  buildBookingReceivedClientEmail,
  buildBookingResolvedClientEmail,
  buildNewBookingAdminEmail,
  type BookingEmailInfo,
} from "./templates";
import type { BookingStatus } from "@/lib/constants";

async function sendEmail(to: string, subject: string, text: string) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada: se omite el envío de email a", to);
    return;
  }

  try {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, text });
  } catch (error) {
    console.error("Error enviando email:", error instanceof Error ? error.message : error);
  }
}

export async function sendNewBookingNotifications(
  info: BookingEmailInfo,
  clientEmail: string,
): Promise<void> {
  const adminEmail = buildNewBookingAdminEmail(info);
  const clientEmailContent = buildBookingReceivedClientEmail(info);

  await Promise.all([
    ADMIN_EMAIL ? sendEmail(ADMIN_EMAIL, adminEmail.subject, adminEmail.text) : Promise.resolve(),
    sendEmail(clientEmail, clientEmailContent.subject, clientEmailContent.text),
  ]);
}

export async function sendBookingResolvedNotification(
  info: BookingEmailInfo,
  status: BookingStatus,
  clientEmail: string,
): Promise<void> {
  const content = buildBookingResolvedClientEmail(info, status);
  if (!content) return;

  await sendEmail(clientEmail, content.subject, content.text);
}
