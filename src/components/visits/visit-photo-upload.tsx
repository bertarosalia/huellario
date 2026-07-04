"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadVisitPhotoAction } from "@/features/visits/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function VisitPhotoUpload({ visitId, petId }: { visitId: string; petId: string }) {
  const formId = useId();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        router.refresh();
      }}
    >
      <Label htmlFor={`${formId}-photo`}>Añadir foto de la visita</Label>
      <input
        id={`${formId}-photo`}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="text-sm"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="outline" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Subiendo…" : "Subir foto"}
      </Button>
    </form>
  );
}
