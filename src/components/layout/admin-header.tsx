import Link from "next/link";
import { Menu, PawPrint } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/bookings", label: "Reservas" },
  { href: "/admin/reviews", label: "Reseñas" },
];

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-10">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <PawPrint className="size-6 text-primary" />
            <span className="text-xl font-bold text-primary">Huellario</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOutAction} className="hidden md:block">
          <Button variant="ghost" type="submit">
            Cerrar sesión
          </Button>
        </form>

        <details className="relative md:hidden">
          <summary
            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-muted [&::-webkit-details-marker]:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </summary>
          <div className="absolute right-0 top-full mt-2 flex w-48 flex-col gap-1 rounded-lg border bg-background p-2 shadow-lg">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
