"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReportFinalTextAction, publishReportAction } from "@/features/reports/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ReportStatus } from "@/lib/constants";

export function ReportEditor({
  reportId,
  status,
  initialFinalText,
}: {
  reportId: string;
  status: ReportStatus;
  initialFinalText: string;
}) {
  const formId = useId();
  const router = useRouter();
  const [finalText, setFinalText] = useState(initialFinalText);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-finalText`}>Texto del informe</Label>
        <Textarea
          id={`${formId}-finalText`}
          value={finalText}
          onChange={(e) => setFinalText(e.target.value)}
          rows={16}
        />
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateReportFinalTextAction(reportId, finalText);
              setMessage("Borrador guardado.");
              router.refresh();
            })
          }
        >
          Guardar borrador
        </Button>
        {status !== "published" && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await updateReportFinalTextAction(reportId, finalText);
                await publishReportAction(reportId);
                router.refresh();
              })
            }
          >
            Publicar informe
          </Button>
        )}
      </div>
    </div>
  );
}
