"use client";

import { useState, useTransition } from "react";
import { generateReportAction } from "@/features/reports/actions";
import { Button } from "@/components/ui/button";

export function GenerateReportButton({ visitId }: { visitId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await generateReportAction(visitId);
            if (result?.error) {
              setError(result.error);
            }
          })
        }
      >
        {isPending ? "Generando…" : "Generar informe con IA"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
