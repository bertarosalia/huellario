"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { uploadVisitPhotoAction } from "@/features/visits/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function VisitPhotoUpload({ visitId, petId }: { visitId: string; petId: string }) {
  const formId = useId();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setError(null);
        setIsSubmitting(true);

        const formData = new FormData();
        formData.set("photo", file);
        const result = await uploadVisitPhotoAction(visitId, petId, {}, formData);
        setIsSubmitting(false);

        if (result?.error) {
          setError(result.error);
          return;
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFileName(null);
        router.refresh();
      }}
    >
      <Label htmlFor={`${formId}-photo`}>Añadir foto de la visita</Label>
      <label
        htmlFor={`${formId}-photo`}
        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-muted hover:text-foreground has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50"
      >
        <ImagePlus className="size-4 shrink-0 text-primary" />
        <span className="truncate">{fileName ?? "Elegir foto…"}</span>
        <input
          id={`${formId}-photo`}
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="outline" disabled={isSubmitting || !fileName} className="w-fit">
        {isSubmitting ? "Subiendo…" : "Subir foto"}
      </Button>
    </form>
  );
}
