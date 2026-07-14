import Link from "next/link";
import { getCurrentUserWithProfile } from "@/features/auth/queries";
import { getPetsForCurrentUser } from "@/features/pets/queries";
import { getPublishedReportsForCurrentUser } from "@/features/reports/queries";
import { DeleteAccountDialog } from "@/components/auth/delete-account-dialog";
import { Button } from "@/components/ui/button";

export default async function ClientDashboardPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  const pets = await getPetsForCurrentUser();
  const reports = await getPublishedReportsForCurrentUser();

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

      <div className="flex items-center justify-between rounded-xl border p-4">
        <p>
          {reports.length === 0
            ? "Todavía no tienes informes publicados."
            : `${reports.length} informe${reports.length === 1 ? "" : "s"} publicado${reports.length === 1 ? "" : "s"}.`}
        </p>
        <Button render={<Link href="/reports" />}>Ver informes</Button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-destructive/30 p-4">
        <div>
          <p className="font-medium">Zona peligrosa</p>
          <p className="text-sm text-muted-foreground">
            Elimina tu cuenta y todos tus datos de forma permanente.
          </p>
        </div>
        <DeleteAccountDialog />
      </div>
    </main>
  );
}
