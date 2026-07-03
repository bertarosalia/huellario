"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petFormSchema, type PetFormInput } from "@/features/pets/schemas";
import type { PetActionState } from "@/features/pets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/features/pets/types";

type Field = {
  name: keyof PetFormInput;
  label: string;
  multiline?: boolean;
  type?: string;
};

const BASIC_FIELDS: Field[] = [
  { name: "name", label: "Nombre" },
  { name: "species", label: "Especie" },
  { name: "breed", label: "Raza" },
  { name: "birthDate", label: "Fecha de nacimiento aproximada", type: "date" },
  { name: "sex", label: "Sexo" },
];

const CARE_FIELDS: Field[] = [
  { name: "feedingRoutine", label: "Rutina de alimentación", multiline: true },
  { name: "medicalInfo", label: "Información médica relevante", multiline: true },
  { name: "medication", label: "Medicación" },
  { name: "vetContact", label: "Veterinario de referencia" },
];

const BEHAVIOR_FIELDS: Field[] = [
  { name: "behaviorNotes", label: "Comportamiento", multiline: true },
  { name: "energyLevel", label: "Nivel de energía" },
  { name: "fearsTriggers", label: "Miedos o desencadenantes", multiline: true },
  { name: "specialNeeds", label: "Necesidades especiales", multiline: true },
  { name: "additionalNotes", label: "Observaciones adicionales", multiline: true },
];

function toFormValues(pet?: Pet | null): Partial<PetFormInput> {
  if (!pet) return {};
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? "",
    birthDate: pet.birth_date ?? "",
    sex: pet.sex ?? "",
    feedingRoutine: pet.feeding_routine ?? "",
    medicalInfo: pet.medical_info ?? "",
    medication: pet.medication ?? "",
    vetContact: pet.vet_contact ?? "",
    behaviorNotes: pet.behavior_notes ?? "",
    energyLevel: pet.energy_level ?? "",
    fearsTriggers: pet.fears_triggers ?? "",
    specialNeeds: pet.special_needs ?? "",
    additionalNotes: pet.additional_notes ?? "",
  };
}

export function PetForm({
  pet,
  action,
  submitLabel,
}: {
  pet?: Pet | null;
  action: (prevState: PetActionState, formData: FormData) => Promise<PetActionState>;
  submitLabel: string;
}) {
  const formId = useId();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetFormInput>({
    resolver: zodResolver(petFormSchema),
    defaultValues: toFormValues(pet),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value ?? ""));

    const result = await action({}, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setServerError(result.error);
    }
  });

  const renderField = ({ name, label, multiline, type }: Field) => (
    <div key={name} className="flex flex-col gap-1.5">
      <Label htmlFor={`${formId}-${name}`}>{label}</Label>
      {multiline ? (
        <Textarea id={`${formId}-${name}`} {...register(name)} />
      ) : (
        <Input id={`${formId}-${name}`} type={type ?? "text"} {...register(name)} />
      )}
      {errors[name] && <p className="text-sm text-destructive">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Datos básicos</h2>
        <div className="grid gap-4 sm:grid-cols-2">{BASIC_FIELDS.map(renderField)}</div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Cuidado y salud</h2>
        <div className="flex flex-col gap-4">{CARE_FIELDS.map(renderField)}</div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Comportamiento</h2>
        <div className="flex flex-col gap-4">{BEHAVIOR_FIELDS.map(renderField)}</div>
      </section>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
