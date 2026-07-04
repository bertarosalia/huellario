import { notFound } from "next/navigation";
import { getReportById } from "@/features/reports/queries";

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Diario de {report.pets?.name}</h1>
        <p className="text-muted-foreground">
          {report.visits?.visited_at
            ? new Date(report.visits.visited_at).toLocaleDateString("es-ES")
            : ""}
        </p>
      </div>

      <article className="whitespace-pre-line rounded-xl border p-6 leading-relaxed">
        {report.final_text}
      </article>
    </main>
  );
}
