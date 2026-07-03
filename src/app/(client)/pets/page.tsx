import Link from "next/link";
import { getPetsForCurrentUser } from "@/features/pets/queries";
import { PetCard } from "@/components/pets/pet-card";
import { Button } from "@/components/ui/button";

export default async function PetsPage() {
  const pets = await getPetsForCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis mascotas</h1>
        <Button render={<Link href="/pets/new" />}>Añadir mascota</Button>
      </div>

      {pets.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no has registrado ninguna mascota.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </main>
  );
}
