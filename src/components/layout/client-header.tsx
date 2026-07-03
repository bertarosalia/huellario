import Link from "next/link";
import { PawPrint } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function ClientHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-10">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <PawPrint className="size-6 text-primary" />
          <span className="text-xl font-bold text-primary">Huellario</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/pets" className="text-muted-foreground hover:text-foreground">
            Mis mascotas
          </Link>
        </nav>
      </div>
      <form action={signOutAction}>
        <Button variant="ghost" type="submit">
          Cerrar sesión
        </Button>
      </form>
    </header>
  );
}
