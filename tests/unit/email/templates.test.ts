import { describe, expect, it } from "vitest";
import {
  buildBookingReceivedClientEmail,
  buildBookingResolvedClientEmail,
  buildNewBookingAdminEmail,
  type BookingEmailInfo,
} from "@/lib/email/templates";
import { BOOKING_RESPONSE_SLA_DAYS } from "@/lib/constants";

const INFO: BookingEmailInfo = {
  petName: "Luna",
  serviceName: "Paseo",
  requestedDate: "2026-08-01",
  requestedTime: "10:00",
  clientName: "Berta",
  clientNotes: "Le da miedo el ascensor",
};

describe("buildNewBookingAdminEmail", () => {
  it("incluye los datos clave de la solicitud", () => {
    const email = buildNewBookingAdminEmail(INFO);
    expect(email.subject).toContain("Luna");
    expect(email.text).toContain("Berta");
    expect(email.text).toContain("Paseo");
    expect(email.text).toContain("2026-08-01");
    expect(email.text).toContain("Le da miedo el ascensor");
  });

  it("omite la línea de notas si no hay notas", () => {
    const email = buildNewBookingAdminEmail({ ...INFO, clientNotes: null });
    expect(email.text).not.toContain("Notas del cliente");
  });
});

describe("buildBookingReceivedClientEmail", () => {
  it("indica el plazo de respuesta configurado", () => {
    const email = buildBookingReceivedClientEmail(INFO);
    expect(email.text).toContain(`${BOOKING_RESPONSE_SLA_DAYS} días`);
    expect(email.text).toContain("Luna");
    expect(email.text).toContain("Paseo");
  });
});

describe("buildBookingResolvedClientEmail", () => {
  it("no genera email para el estado pending", () => {
    expect(buildBookingResolvedClientEmail(INFO, "pending")).toBeNull();
  });

  it.each([
    ["accepted", "aceptada"],
    ["rejected", "rechazada"],
    ["completed", "completada"],
    ["cancelled", "cancelada"],
  ] as const)("genera el mensaje correcto para el estado %s", (status, expectedWord) => {
    const email = buildBookingResolvedClientEmail(INFO, status);
    expect(email).not.toBeNull();
    expect(email!.text.toLowerCase()).toContain(expectedWord);
  });
});
