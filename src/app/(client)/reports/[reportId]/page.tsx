import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getReportById } from "@/features/reports/queries";
import { getVisitPhotos } from "@/features/visits/queries";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import { VisitPhotoGallery } from "@/components/visits/visit-photo-gallery";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportById(reportId);

  if (!report) {
    notFound();
  }

  const photos = await getVisitPhotos(report.visit_id);
  const photoUrls = await getSignedPhotoUrls(photos.map((p) => p.storage_path));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <Link
        href="/reports"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a mis informes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Diario de {report.pets?.name}</h1>
        <p className="text-muted-foreground">
          {report.visits?.visited_at
            ? new Date(report.visits.visited_at).toLocaleDateString("es-ES")
            : ""}
        </p>
      </div>

      <VisitPhotoGallery photoUrls={photoUrls} />

      <article className="whitespace-pre-line rounded-xl border p-6 leading-relaxed">
        {report.final_text}
      </article>
    </main>
  );
}
