import { describe, expect, it } from "vitest";
import { petFormSchema } from "@/features/pets/schemas";

describe("petFormSchema", () => {
  it("acepta solo con los campos obligatorios", () => {
    const result = petFormSchema.safeParse({ name: "Luna", species: "Perro" });
    expect(result.success).toBe(true);
  });

  it("rechaza sin nombre", () => {
    expect(petFormSchema.safeParse({ name: "", species: "Perro" }).success).toBe(false);
  });

  it("rechaza sin especie", () => {
    expect(petFormSchema.safeParse({ name: "Luna", species: "" }).success).toBe(false);
  });

  it("acepta campos opcionales de cuidado vacíos", () => {
    const result = petFormSchema.safeParse({
      name: "Luna",
      species: "Perro",
      breed: "",
      medicalInfo: "",
      fearsTriggers: "",
    });
    expect(result.success).toBe(true);
  });
});
