import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <Link href="/" className="flex items-center gap-2">
        <PawPrint className="size-6 text-primary" />
        <span className="text-xl font-bold text-primary">Huellario</span>
      </Link>
      {children}
    </div>
  );
}
