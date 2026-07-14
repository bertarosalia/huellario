"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./schemas";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

// Supabase Auth devuelve sus mensajes de error en inglés; se traducen los
// casos habituales para mantener el tono en español del resto de la app.
function translateSignUpError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Ya existe una cuenta con ese email.";
  }
  if (normalized.includes("password")) {
    return "La contraseña no cumple los requisitos mínimos.";
  }
  if (normalized.includes("email") && normalized.includes("invalid")) {
    return "El email no es válido.";
  }
  return "No se pudo completar el registro. Inténtalo de nuevo.";
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw: RegisterInput = {
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
      },
      // Sin esto, Supabase construye el link del email de confirmación con
      // el "Site URL" configurado en su propio dashboard (Authentication →
      // URL Configuration) en vez de con la URL de este entorno — por eso
      // los emails de producción apuntaban a localhost:3000. Al fijarlo
      // aquí, el link es correcto tanto en local como en producción según
      // NEXT_PUBLIC_SITE_URL, siempre que esa URL también esté en la lista
      // de "Redirect URLs" permitidas del proyecto de Supabase.
      emailRedirectTo: `${SITE_URL}/login`,
    },
  });

  if (error) {
    return { error: translateSignUpError(error.message) };
  }

  return { success: true };
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw: LoginInput = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.role === "admin" ? "/admin/dashboard" : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
