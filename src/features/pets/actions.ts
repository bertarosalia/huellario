"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { petFormSchema, type PetFormInput } from "./schemas";

export type PetActionState = {
  error?: string;
};

function readForm(formData: FormData): PetFormInput {
  return {
    name: String(formData.get("name") ?? ""),
    species: String(formData.get("species") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    sex: String(formData.get("sex") ?? ""),
    feedingRoutine: String(formData.get("feedingRoutine") ?? ""),
    medicalInfo: String(formData.get("medicalInfo") ?? ""),
    medication: String(formData.get("medication") ?? ""),
    vetContact: String(formData.get("vetContact") ?? ""),
    behaviorNotes: String(formData.get("behaviorNotes") ?? ""),
    energyLevel: String(formData.get("energyLevel") ?? ""),
    fearsTriggers: String(formData.get("fearsTriggers") ?? ""),
    specialNeeds: String(formData.get("specialNeeds") ?? ""),
    additionalNotes: String(formData.get("additionalNotes") ?? ""),
  };
}

export async function createPetAction(
  _prevState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const parsed = petFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión" };
  }

  const { data } = parsed;
  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    name: data.name,
    species: data.species,
    breed: data.breed || null,
    birth_date: data.birthDate || null,
    sex: data.sex || null,
    feeding_routine: data.feedingRoutine || null,
    medical_info: data.medicalInfo || null,
    medication: data.medication || null,
    vet_contact: data.vetContact || null,
    behavior_notes: data.behaviorNotes || null,
    energy_level: data.energyLevel || null,
    fears_triggers: data.fearsTriggers || null,
    special_needs: data.specialNeeds || null,
    additional_notes: data.additionalNotes || null,
  });

  if (error) {
    return { error: "No se pudo guardar la mascota" };
  }

  revalidatePath("/pets");
  redirect("/pets");
}

export async function updatePetAction(
  petId: string,
  _prevState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const parsed = petFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data } = parsed;

  const { error } = await supabase
    .from("pets")
    .update({
      name: data.name,
      species: data.species,
      breed: data.breed || null,
      birth_date: data.birthDate || null,
      sex: data.sex || null,
      feeding_routine: data.feedingRoutine || null,
      medical_info: data.medicalInfo || null,
      medication: data.medication || null,
      vet_contact: data.vetContact || null,
      behavior_notes: data.behaviorNotes || null,
      energy_level: data.energyLevel || null,
      fears_triggers: data.fearsTriggers || null,
      special_needs: data.specialNeeds || null,
      additional_notes: data.additionalNotes || null,
    })
    .eq("id", petId);

  if (error) {
    return { error: "No se pudo actualizar la mascota" };
  }

  revalidatePath("/pets");
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function deletePetAction(petId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pets").delete().eq("id", petId);

  if (error) {
    throw new Error("No se pudo eliminar la mascota");
  }

  revalidatePath("/pets");
  redirect("/pets");
}
