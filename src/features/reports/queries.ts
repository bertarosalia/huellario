import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ReportWithRelations } from "./types";

const REPORT_RELATIONS_SELECT = `*, pets ( name ), visits ( visited_at, booking_id )`;

export async function getReportById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle<ReportWithRelations>();

  if (error) throw error;
  return data;
}

export async function getReportByVisitId(visitId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_RELATIONS_SELECT)
    .eq("visit_id", visitId)
    .maybeSingle<ReportWithRelations>();

  if (error) throw error;
  return data;
}

// RLS ya filtra: el cliente solo ve informes publicados de sus propias
// mascotas (política reports_select_admin_or_published_own).
export async function getPublishedReportsForCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_RELATIONS_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<ReportWithRelations[]>();

  if (error) throw error;
  return data;
}
