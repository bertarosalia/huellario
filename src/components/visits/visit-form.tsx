"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  visitFormSchema,
  CHECKLIST_ITEMS,
  type VisitFormInput,
} from "@/features/visits/schemas";
import type { VisitActionState } from "@/features/visits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function VisitForm({
  bookingId,
  action,
}: {
  bookingId: string;
  action: (prevState: VisitActionState, formData: FormData) => Promise<VisitActionState>;
}) {
  const formId = useId();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitFormInput>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      bookingId,
      visitedDate: new Date().toISOString().slice(0, 10),
      visitedTime: new Date().toTimeString().slice(0, 5),
      durationMinutes: "",
      mood: "",
      ate: false,
      drankWater: false,
      walked: false,
      played: false,
      medicationGiven: false,
      bathroomOk: false,
      cleanedArea: false,
      quickNotes: "",
      incidents: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, String(value ?? "")));

    const result = await action({}, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-visitedDate`}>Fecha de la visita</Label>
          <Input id={`${formId}-visitedDate`} type="date" {...register("visitedDate")} />
          {errors.visitedDate && (
            <p className="text-sm text-destructive">{errors.visitedDate.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-visitedTime`}>Hora</Label>
          <Input id={`${formId}-visitedTime`} type="time" {...register("visitedTime")} />
          {errors.visitedTime && (
            <p className="text-sm text-destructive">{errors.visitedTime.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-durationMinutes`}>Duración (min)</Label>
          <Input id={`${formId}-durationMinutes`} type="number" {...register("durationMinutes")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-mood`}>Estado general de la mascota</Label>
        <Input id={`${formId}-mood`} {...register("mood")} />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Checklist de cuidados</legend>
        {CHECKLIST_ITEMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <input
              id={`${formId}-${key}`}
              type="checkbox"
              className="size-4 rounded border-input"
              {...register(key as "ate")}
            />
            <Label htmlFor={`${formId}-${key}`} className="font-normal">
              {label}
            </Label>
          </div>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-quickNotes`}>Notas rápidas</Label>
        <Textarea id={`${formId}-quickNotes`} {...register("quickNotes")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-incidents`}>Incidencias</Label>
        <Textarea id={`${formId}-incidents`} {...register("incidents")} />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar visita"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
