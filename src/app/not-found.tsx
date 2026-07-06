import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <PawPrint className="size-10 text-primary" />
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground">
        No hemos encontrado lo que buscabas. Puede que el enlace esté roto o
        que la página se haya movido.
      </p>
      <Button render={<Link href="/" />}>Volver al inicio</Button>
    </main>
  );
}
