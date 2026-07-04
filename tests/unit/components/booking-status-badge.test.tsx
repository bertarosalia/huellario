import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import type { BookingStatus } from "@/lib/constants";

const CASES: Array<[BookingStatus, string]> = [
  ["pending", "Pendiente"],
  ["accepted", "Aceptada"],
  ["rejected", "Rechazada"],
  ["cancelled", "Cancelada"],
  ["completed", "Completada"],
];

describe("BookingStatusBadge", () => {
  it.each(CASES)("muestra la etiqueta correcta para %s", (status, label) => {
    render(<BookingStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
