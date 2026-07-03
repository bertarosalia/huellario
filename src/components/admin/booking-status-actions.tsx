"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatusAction } from "@/features/bookings/actions";
import type { BookingStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const TRANSITIONS: Record<BookingStatus, { status: BookingStatus; label: string; variant: "default" | "outline" | "destructive" }[]> = {
  pending: [
    { status: "accepted", label: "Aceptar", variant: "default" },
    { status: "rejected", label: "Rechazar", variant: "destructive" },
  ],
  accepted: [
    { status: "completed", label: "Marcar como completada", variant: "default" },
    { status: "cancelled", label: "Cancelar", variant: "destructive" },
  ],
  rejected: [],
  cancelled: [],
  completed: [],
};

export function BookingStatusActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const transitions = TRANSITIONS[status];
  if (transitions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {transitions.map((t) => (
        <Button
          key={t.status}
          variant={t.variant}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateBookingStatusAction(bookingId, t.status);
              router.refresh();
            })
          }
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
