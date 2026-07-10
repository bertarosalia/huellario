import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getVisitById, getVisitPhotos } from "@/features/visits/queries";
import { CHECKLIST_ITEMS } from "@/features/visits/schemas";
import { getReportByVisitId } from "@/features/reports/queries";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { VisitPhotoUpload } from "@/components/visits/visit-photo-upload";
import { VisitPhotoGallery } from "@/components/visits/visit-photo-gallery";
import { Button } from "@/components/ui/button";

const CHECKLIST_DB_KEYS: Record<string, keyof NonNullable<Awaited<ReturnType<typeof getVisitById>>>["care_checklist"]> = {
  ate: "ate",
  drankWater: "drank_water",
  walked: "walked",
  played: "played",
  medicationGiven: "medication_given",
  bathroomOk: "bathroom_ok",
  cleanedArea: "cleaned_area",
};

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const visit = await getVisitById(visitId);

  if (!visit) {
    notFound();
  }

  const report = await getReportByVisitId(visit.id);
  const photos = await getVisitPhotos(visit.id);
  const photoUrls = await getSignedPhotoUrls(photos.map((p) => p.storage_path));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <Link
        href={`/admin/bookings/${visit.booking_id}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la reserva
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Visita de {visit.pets?.name}</h1>
          <p className="text-muted-foreground">
            {new Date(visit.visited_at).toLocaleString("es-ES")}
            {visit.duration_minutes ? ` · ${visit.duration_minutes} min` : ""}
          </p>
        </div>
        {report ? (
          <Button variant="outline" render={<Link href={`/admin/reports/${report.id}/edit`} />}>
            {report.status === "published" ? "Ver informe publicado" : "Revisar borrador"}
          </Button>
        ) : (
          <GenerateReportButton visitId={visit.id} />
        )}
      </div>

      {visit.mood && (
        <div>
          <h2 className="font-semibold">Estado general</h2>
          <p>{visit.mood}</p>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-semibold">Checklist de cuidados</h2>
        <ul className="flex flex-col gap-1">
          {CHECKLIST_ITEMS.map(({ key, label }) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span aria-hidden>{visit.care_checklist[CHECKLIST_DB_KEYS[key]] ? "✅" : "⬜"}</span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {visit.quick_notes && (
        <div>
          <h2 className="font-semibold">Notas rápidas</h2>
          <p>{visit.quick_notes}</p>
        </div>
      )}

      <div>
        <h2 className="font-semibold">Incidencias</h2>
        <p>{visit.incidents || "No se han registrado incidencias."}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Fotos</h2>
        <VisitPhotoGallery photoUrls={photoUrls} />
        <VisitPhotoUpload visitId={visit.id} petId={visit.pet_id} />
      </div>
    </main>
  );
}
