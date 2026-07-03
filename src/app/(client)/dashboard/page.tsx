import Link from "next/link";
import { getCurrentUserWithProfile } from "@/features/auth/queries";
import { getPetsForCurrentUser } from "@/features/pets/queries";
import { Button } from "@/components/ui/button";

export default async function ClientDashboardPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  const pets = await getPetsForCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <p>
          {pets.length === 0
            ? "Todavía no has registrado mascotas."
            : `${pets.length} mascota${pets.length === 1 ? "" : "s"} registrada${pets.length === 1 ? "" : "s"}.`}
        </p>
        <Button render={<Link href="/pets" />}>Ver mascotas</Button>
      </div>
    </main>
  );
}
