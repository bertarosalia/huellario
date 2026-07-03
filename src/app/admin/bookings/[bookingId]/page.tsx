import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingById } from "@/features/bookings/queries";
import { getVisitByBookingId } from "@/features/visits/queries";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { BookingStatusActions } from "@/components/admin/booking-status-actions";
import { Button } from "@/components/ui/button";
import type { BookingWithRelations } from "@/features/bookings/types";

const PET_CARE_FIELDS: Array<{
  label: string;
  key: keyof NonNullable<BookingWithRelations["pets"]>;
}> = [
  { label: "Raza", key: "breed" },
  { label: "Información médica relevante", key: "medical_info" },
  { label: "Medicación", key: "medication" },
  { label: "Veterinario de referencia", key: "vet_contact" },
  { label: "Comportamiento", key: "behavior_notes" },
  { label: "Nivel de energía", key: "energy_level" },
  { label: "Miedos o desencadenantes", key: "fears_triggers" },
  { label: "Necesidades especiales", key: "special_needs" },
];

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  const canRegisterVisit = booking.status === "accepted" || booking.status === "completed";
  const visit = canRegisterVisit ? await getVisitByBookingId(booking.id) : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {booking.services?.name} — {booking.pets?.name}
          </h1>
          <p className="text-muted-foreground">
            {booking.requested_date} a las {booking.requested_time.slice(0, 5)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <section className="flex flex-col gap-2 rounded-xl border p-4">
        <h2 className="font-semibold">Cliente</h2>
        <p>{booking.profiles?.full_name}</p>
        {booking.profiles?.phone && (
          <p className="text-sm text-muted-foreground">{booking.profiles.phone}</p>
        )}
        {booking.address && (
          <p className="text-sm text-muted-foreground">Dirección: {booking.address}</p>
        )}
        {booking.client_notes && (
          <p className="text-sm text-muted-foreground">
            Observaciones del cliente: {booking.client_notes}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-xl border p-4">
        <h2 className="font-semibold">Información de la mascota</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {PET_CARE_FIELDS.filter(({ key }) => booking.pets?.[key]).map(({ label, key }) => (
            <div key={key}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd>{booking.pets?.[key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {canRegisterVisit && (
        <section className="flex items-center justify-between rounded-xl border p-4">
          <h2 className="font-semibold">Visita</h2>
          {visit ? (
            <Button variant="outline" render={<Link href={`/admin/visits/${visit.id}`} />}>
              Ver visita
            </Button>
          ) : (
            <Button render={<Link href={`/admin/visits/new?bookingId=${booking.id}`} />}>
              Crear visita
            </Button>
          )}
        </section>
      )}

      <BookingStatusActions bookingId={booking.id} status={booking.status} />
    </main>
  );
}
