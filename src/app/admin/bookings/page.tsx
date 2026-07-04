import Link from "next/link";
import { getAllBookings } from "@/features/bookings/queries";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Reservas</h1>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No hay reservas todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Cliente</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Mascota</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Servicio</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Fecha</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/admin/bookings/${booking.id}`} className="hover:underline">
                      {booking.profiles?.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{booking.pets?.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{booking.services?.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {booking.requested_date} {booking.requested_time.slice(0, 5)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
