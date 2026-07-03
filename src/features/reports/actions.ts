"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPetById } from "@/features/pets/queries";
import type { Visit } from "@/features/visits/types";
import {
  generateVisitReport,
  formatReportText,
  MODEL,
  PROMPT_VERSION,
} from "@/lib/ai/generate-report";
import { getReportByVisitId } from "./queries";

export type ReportActionState = {
  error?: string;
};

export async function generateReportAction(visitId: string): Promise<ReportActionState> {
  const supabase = await createClient();

  const existing = await getReportByVisitId(visitId);
  if (existing) {
    redirect(`/admin/reports/${existing.id}/edit`);
  }

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .maybeSingle<Visit>();

  if (visitError || !visit) {
    return { error: "La visita no existe" };
  }

  const pet = await getPetById(visit.pet_id);
  if (!pet) {
    return { error: "La mascota asociada no existe" };
  }

  let generated;
  try {
    generated = await generateVisitReport(pet, visit);
  } catch {
    return { error: "No se pudo generar el informe con IA. Inténtalo de nuevo." };
  }

  const text = formatReportText(generated);
  const now = new Date().toISOString();

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      visit_id: visit.id,
      pet_id: visit.pet_id,
      generated_text: text,
      final_text: text,
      status: "draft",
      ai_model: MODEL,
      prompt_version: PROMPT_VERSION,
      generated_at: now,
    })
    .select("id")
    .single();

  if (insertError || !report) {
    return { error: "No se pudo guardar el informe generado" };
  }

  revalidatePath(`/admin/visits/${visitId}`);
  redirect(`/admin/reports/${report.id}/edit`);
}

export async function updateReportFinalTextAction(reportId: string, finalText: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ final_text: finalText })
    .eq("id", reportId);

  if (error) {
    throw new Error("No se pudo guardar el informe");
  }

  revalidatePath(`/admin/reports/${reportId}/edit`);
}

export async function publishReportAction(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    throw new Error("No se pudo publicar el informe");
  }

  revalidatePath(`/admin/reports/${reportId}/edit`);
}
