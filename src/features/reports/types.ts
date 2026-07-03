import type { ReportStatus } from "@/lib/constants";

export type Report = {
  id: string;
  visit_id: string;
  pet_id: string;
  generated_text: string | null;
  final_text: string | null;
  status: ReportStatus;
  ai_model: string | null;
  prompt_version: string | null;
  generated_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportWithRelations = Report & {
  pets: { name: string } | null;
  visits: { visited_at: string; booking_id: string } | null;
};
