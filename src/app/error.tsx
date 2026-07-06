"use client";

import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <PawPrint className="size-10 text-primary" />
      <h1 className="text-2xl font-semibold">Algo ha ido mal</h1>
      <p className="text-muted-foreground">
        Ha ocurrido un error inesperado. Puedes intentarlo de nuevo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  );
}
