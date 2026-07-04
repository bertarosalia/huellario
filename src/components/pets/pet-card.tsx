import Image from "next/image";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Pet } from "@/features/pets/types";

export function PetCard({ pet, photoUrl }: { pet: Pet; photoUrl?: string | null }) {
  return (
    <Link href={`/pets/${pet.id}`}>
      <Card className="transition-colors hover:border-primary/40">
        <CardContent className="flex items-center gap-4">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Foto de ${pet.name}`}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PawPrint className="size-6" />
            </div>
          )}
          <div>
            <p className="font-semibold">{pet.name}</p>
            <p className="text-sm text-muted-foreground">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
