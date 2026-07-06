import { BOOKING_RESPONSE_SLA_DAYS, type BookingStatus } from "@/lib/constants";

export type BookingEmailInfo = {
  petName: string;
  serviceName: string;
  requestedDate: string;
  requestedTime: string;
  clientName: string;
  clientNotes: string | null;
};

export type EmailContent = {
  subject: string;
  text: string;
};

export function buildNewBookingAdminEmail(info: BookingEmailInfo): EmailContent {
  return {
    subject: `Nueva solicitud de reserva: ${info.petName}`,
    text: [
      `Nueva solicitud de reserva de ${info.clientName}.`,
      "",
      `Mascota: ${info.petName}`,
      `Servicio: ${info.serviceName}`,
      `Fecha: ${info.requestedDate} a las ${info.requestedTime}`,
      info.clientNotes ? `Notas del cliente: ${info.clientNotes}` : null,
      "",
      "Revisa la solicitud en el panel de administración para aceptarla o rechazarla.",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

export function buildBookingReceivedClientEmail(info: BookingEmailInfo): EmailContent {
  return {
    subject: "Hemos recibido tu solicitud de reserva",
    text: [
      `Hola,`,
      "",
      `Hemos recibido tu solicitud de "${info.serviceName}" para ${info.petName} el ${info.requestedDate} a las ${info.requestedTime}.`,
      "",
      `Te responderemos en un plazo máximo de ${BOOKING_RESPONSE_SLA_DAYS} días.`,
      "",
      "Gracias por confiar en Huellario.",
    ].join("\n"),
  };
}

const STATUS_MESSAGES: Record<Exclude<BookingStatus, "pending">, string> = {
  accepted: "Tu solicitud de reserva ha sido aceptada.",
  rejected: "Tu solicitud de reserva ha sido rechazada.",
  completed: "Tu reserva se ha marcado como completada.",
  cancelled: "Tu reserva ha sido cancelada.",
};

export function buildBookingResolvedClientEmail(
  info: BookingEmailInfo,
  status: BookingStatus,
): EmailContent | null {
  if (status === "pending") return null;

  return {
    subject: `Actualización de tu reserva: ${info.petName}`,
    text: [
      STATUS_MESSAGES[status],
      "",
      `Mascota: ${info.petName}`,
      `Servicio: ${info.serviceName}`,
      `Fecha: ${info.requestedDate} a las ${info.requestedTime}`,
      "",
      "Puedes consultar los detalles en tu área de reservas.",
    ].join("\n"),
  };
}
