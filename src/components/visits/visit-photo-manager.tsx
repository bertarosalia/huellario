import Image from "next/image";
import { X } from "lucide-react";
import { deleteVisitPhotoAction } from "@/features/visits/actions";

type VisitPhoto = {
  id: string;
  url: string;
  storagePath: string;
};

export function VisitPhotoManager({
  photos,
  visitId,
}: {
  photos: VisitPhoto[];
  visitId: string;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {photos.map((photo) => {
        const deletePhoto = deleteVisitPhotoAction.bind(null, photo.id, visitId, photo.storagePath);
        return (
          <div key={photo.id} className="group relative">
            <Image
              src={photo.url}
              alt="Foto de la visita"
              width={150}
              height={150}
              className="aspect-square w-full rounded-lg object-cover"
            />
            <form action={deletePhoto} className="absolute top-1 right-1">
              <button
                type="submit"
                aria-label="Eliminar foto"
                className="flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="size-3.5" />
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
