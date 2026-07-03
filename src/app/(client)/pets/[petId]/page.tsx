import Link from "next/link";
import { notFound } from "next/navigation";
import { getPetById } from "@/features/pets/queries";
import { deletePetAction } from "@/features/pets/actions";
import { Button } from "@/components/ui/button";

const DETAIL_FIELDS: Array<{ label: string; key: keyof NonNullable<Awaited<ReturnType<typeof getPetById>>> }> = [
  { label: "Raza", key: "breed" },
  { label: "Fecha de nacimiento aproximada", key: "birth_date" },
  { label: "Sexo", key: "sex" },
  { label: "Rutina de alimentación", key: "feeding_routine" },
  { label: "Información médica relevante", key: "medical_info" },
  { label: "Medicación", key: "medication" },
  { label: "Veterinario de referencia", key: "vet_contact" },
  { label: "Comportamiento", key: "behavior_notes" },
  { label: "Nivel de energía", key: "energy_level" },
  { label: "Miedos o desencadenantes", key: "fears_triggers" },
  { label: "Necesidades especiales", key: "special_needs" },
  { label: "Observaciones adicionales", key: "additional_notes" },
];

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await getPetById(petId);

  if (!pet) {
    notFound();
  }

  const deleteWithId = deletePetAction.bind(null, pet.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pet.name}</h1>
          <p className="text-muted-foreground">{pet.species}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/pets/${pet.id}/edit`} />}>
            Editar
          </Button>
          <form action={deleteWithId}>
            <Button variant="destructive" type="submit">
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {DETAIL_FIELDS.filter(({ key }) => pet[key]).map(({ label, key }) => (
          <div key={key}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd>{pet[key]}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
