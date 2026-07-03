import { createPetAction } from "@/features/pets/actions";
import { PetForm } from "@/components/pets/pet-form";

export default function NewPetPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Nueva mascota</h1>
      <PetForm action={createPetAction} submitLabel="Guardar mascota" />
    </main>
  );
}
