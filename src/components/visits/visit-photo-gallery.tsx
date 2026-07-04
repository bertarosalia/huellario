import Image from "next/image";

export function VisitPhotoGallery({ photoUrls }: { photoUrls: string[] }) {
  if (photoUrls.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {photoUrls.map((url) => (
        <Image
          key={url}
          src={url}
          alt="Foto de la visita"
          width={150}
          height={150}
          className="aspect-square w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
