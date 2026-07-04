import Link from "next/link";
import { getPublishedReportsForCurrentUser } from "@/features/reports/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReportsPage() {
  const reports = await getPublishedReportsForCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Diarios de mis mascotas</h1>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">Todavía no tienes informes publicados.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent>
                  <p className="font-semibold">{report.pets?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.visits?.visited_at
                      ? new Date(report.visits.visited_at).toLocaleDateString("es-ES")
                      : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
