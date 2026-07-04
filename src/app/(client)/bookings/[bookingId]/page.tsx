import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingById } from "@/features/bookings/queries";
import { getVisitByBookingId } from "@/features/visits/queries";
import { getReportByVisitId } from "@/features/reports/queries";
import { getReviewByBookingId } from "@/features/reviews/queries";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { ReviewForm } from "@/components/reviews/review-form";
import { Button } from "@/components/ui/button";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  const visit = await getVisitByBookingId(booking.id);
  const report = visit ? await getReportByVisitId(visit.id) : null;
  const review = booking.status === "completed" ? await getReviewByBookingId(booking.id) : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{booking.services?.name}</h1>
          <p className="text-muted-foreground">
            {booking.pets?.name} · {booking.requested_date} a las{" "}
            {booking.requested_time.slice(0, 5)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {booking.address && (
          <div>
            <dt className="text-sm text-muted-foreground">Dirección o zona</dt>
            <dd>{booking.address}</dd>
          </div>
        )}
        {booking.client_notes && (
          <div>
            <dt className="text-sm text-muted-foreground">Tus observaciones</dt>
            <dd>{booking.client_notes}</dd>
          </div>
        )}
      </dl>

      {report && (
        <div className="flex items-center justify-between rounded-xl border p-4">
          <p>El diario de esta visita ya está disponible.</p>
          <Button render={<Link href={`/reports/${report.id}`} />}>Ver diario</Button>
        </div>
      )}

      {booking.status === "completed" && (
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-semibold">Reseña</h2>
          {review ? (
            <p className="text-sm text-muted-foreground">
              Ya has dejado tu reseña para este servicio.
            </p>
          ) : (
            <ReviewForm bookingId={booking.id} />
          )}
        </div>
      )}
    </main>
  );
}
