import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("registerSchema", () => {
  const valid = {
    fullName: "Berta Test",
    phone: "",
    email: "berta@example.com",
    password: "supersegura123",
    confirmPassword: "supersegura123",
  };

  it("acepta datos válidos", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = registerSchema.safeParse({ ...valid, email: "no-es-un-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña demasiado corta", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza si las contraseñas no coinciden", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "otra-contraseña",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rechaza nombre demasiado corto", () => {
    const result = registerSchema.safeParse({ ...valid, fullName: "A" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    expect(
      loginSchema.safeParse({ email: "berta@example.com", password: "cualquiera" }).success,
    ).toBe(true);
  });

  it("rechaza email vacío o inválido", () => {
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "no-email", password: "x" }).success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
