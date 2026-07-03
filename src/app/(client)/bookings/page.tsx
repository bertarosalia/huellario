import Link from "next/link";
import { getBookingsForCurrentUser } from "@/features/bookings/queries";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function BookingsPage() {
  const bookings = await getBookingsForCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis reservas</h1>
        <Button render={<Link href="/bookings/new" />}>Solicitar reserva</Button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">Todavía no tienes reservas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {booking.services?.name} · {booking.pets?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.requested_date} a las {booking.requested_time.slice(0, 5)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
