import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Pet } from "./types";

export async function getPetsForCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Pet[]>();

  if (error) throw error;
  return data;
}

export async function getPetById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .maybeSingle<Pet>();

  if (error) throw error;
  return data;
}
