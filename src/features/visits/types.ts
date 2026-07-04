export type CareChecklist = {
  ate: boolean;
  drank_water: boolean;
  walked: boolean;
  played: boolean;
  medication_given: boolean;
  bathroom_ok: boolean;
  cleaned_area: boolean;
};

export type Visit = {
  id: string;
  booking_id: string;
  pet_id: string;
  visited_at: string;
  duration_minutes: number | null;
  mood: string | null;
  care_checklist: CareChecklist;
  quick_notes: string | null;
  incidents: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type VisitWithRelations = Visit & {
  pets: { name: string; species: string } | null;
  bookings: { requested_date: string; requested_time: string } | null;
};

export type VisitPhoto = {
  id: string;
  visit_id: string;
  pet_id: string;
  storage_path: string;
  alt_text: string | null;
  created_at: string;
};
