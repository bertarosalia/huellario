import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicHeader({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean;
  dashboardHref: string;
}) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-10">
      <Link href="/" className="flex items-center gap-2">
        <PawPrint className="size-6 text-primary" />
        <span className="text-xl font-bold text-primary">Huellario</span>
      </Link>
      <nav className="flex items-center gap-2">
        {isAuthenticated ? (
          <Button render={<Link href={dashboardHref} />}>Ir a mi panel</Button>
        ) : (
          <>
            <Button variant="ghost" render={<Link href="/login" />}>
              Iniciar sesión
            </Button>
            <Button render={<Link href="/register" />}>Registrarse</Button>
          </>
        )}
      </nav>
    </header>
  );
}
