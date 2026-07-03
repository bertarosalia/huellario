import Link from "next/link";
import { getCurrentUserWithProfile } from "@/features/auth/queries";
import { getAllBookings } from "@/features/bookings/queries";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  const bookings = await getAllBookings();
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">
          Panel de administración{profile?.full_name ? ` — ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <p>
          {pendingCount === 0
            ? "No hay reservas pendientes."
            : `${pendingCount} reserva${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de revisión.`}
        </p>
        <Button render={<Link href="/admin/bookings" />}>Ver reservas</Button>
      </div>
    </main>
  );
}
