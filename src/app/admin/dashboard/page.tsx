import { getCurrentUserWithProfile } from "@/features/auth/queries";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentUserWithProfile();

  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">
          Panel de administración{profile?.full_name ? ` — ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>
      <form action={signOutAction}>
        <Button variant="outline" type="submit">
          Cerrar sesión
        </Button>
      </form>
    </main>
  );
}
