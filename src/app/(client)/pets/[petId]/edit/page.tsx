import { notFound } from "next/navigation";
import { getPetById } from "@/features/pets/queries";
import { updatePetAction } from "@/features/pets/actions";
import { PetForm } from "@/components/pets/pet-form";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await getPetById(petId);

  if (!pet) {
    notFound();
  }

  const updateWithId = updatePetAction.bind(null, pet.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Editar {pet.name}</h1>
      <PetForm pet={pet} action={updateWithId} submitLabel="Guardar cambios" />
    </main>
  );
}
