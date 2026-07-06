import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getReportById } from "@/features/reports/queries";
import { ReportEditor } from "@/components/reports/report-editor";
import { Badge } from "@/components/ui/badge";

export default async function ReportEditPage({
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
      <Link
        href={`/admin/visits/${report.visit_id}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la visita
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Revisar diario — {report.pets?.name}</h1>
          <p className="text-muted-foreground">
            Generado el {report.generated_at ? new Date(report.generated_at).toLocaleString("es-ES") : "—"}
          </p>
        </div>
        <Badge variant={report.status === "published" ? "default" : "outline"}>
          {report.status === "published" ? "Publicado" : "Borrador"}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Modelo: {report.ai_model} · Prompt: {report.prompt_version}
      </p>

      <ReportEditor
        reportId={report.id}
        status={report.status}
        initialFinalText={report.final_text ?? ""}
      />
    </main>
  );
}
