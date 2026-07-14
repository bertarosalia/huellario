"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas";
import { updatePasswordAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const formId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El link del email trae la sesión de recuperación en el fragmento de
  // la URL (#access_token=...&type=recovery), que solo el navegador puede
  // leer. Crear el cliente aquí hace que la detecte y la guarde en
  // cookies, para que updatePasswordAction (server action) pueda verla.
  useEffect(() => {
    createClient();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    const result = await updatePasswordAction({}, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setServerError(result.error);
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Elige una nueva contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-password`}>Nueva contraseña</Label>
            <Input
              id={`${formId}-password`}
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-confirmPassword`}>Confirmar contraseña</Label>
            <Input
              id={`${formId}-confirmPassword`}
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar nueva contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
