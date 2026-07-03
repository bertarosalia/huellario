import { notFound } from "next/navigation";
import { getBookingById } from "@/features/bookings/queries";
import { createVisitAction } from "@/features/visits/actions";
import { VisitForm } from "@/components/visits/visit-form";

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  if (booking.status !== "accepted" && booking.status !== "completed") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">Nueva visita</h1>
        <p className="text-muted-foreground">
          Solo se pueden registrar visitas de reservas aceptadas o completadas.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Nueva visita</h1>
        <p className="text-muted-foreground">
          {booking.services?.name} · {booking.pets?.name}
        </p>
      </div>
      <VisitForm bookingId={booking.id} action={createVisitAction} />
    </main>
  );
}
