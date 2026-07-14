import Link from "next/link";
import { PawPrint } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/terminos", label: "Términos de servicio" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="size-5 text-primary" />
          <span className="text-lg font-bold text-primary">Huellario</span>
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Huellario. Pet sitting a domicilio con diario
          personalizado de cada visita.
        </p>
      </div>
    </footer>
  );
}
