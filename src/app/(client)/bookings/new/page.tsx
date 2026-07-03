import Link from "next/link";
import { getPetsForCurrentUser } from "@/features/pets/queries";
import { getActiveServices } from "@/features/bookings/queries";
import { createBookingAction } from "@/features/bookings/actions";
import { BookingForm } from "@/components/bookings/booking-form";
import { Button } from "@/components/ui/button";

export default async function NewBookingPage() {
  const [pets, services] = await Promise.all([getPetsForCurrentUser(), getActiveServices()]);

  if (pets.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">Solicitar reserva</h1>
        <p className="text-muted-foreground">
          Necesitas registrar al menos una mascota antes de solicitar una reserva.
        </p>
        <Button render={<Link href="/pets/new" />} className="w-fit">
          Añadir mascota
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Solicitar reserva</h1>
      <BookingForm pets={pets} services={services} action={createBookingAction} />
    </main>
  );
}
