import { notFound } from "next/navigation";
import { getVisitById } from "@/features/visits/queries";
import { CHECKLIST_ITEMS } from "@/features/visits/schemas";

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Visita de {visit.pets?.name}</h1>
        <p className="text-muted-foreground">
          {new Date(visit.visited_at).toLocaleString("es-ES")}
          {visit.duration_minutes ? ` · ${visit.duration_minutes} min` : ""}
        </p>
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
    </main>
  );
}
