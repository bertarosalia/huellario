"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema, type BookingFormInput } from "@/features/bookings/schemas";
import type { BookingActionState } from "@/features/bookings/actions";
import type { Pet } from "@/features/pets/types";
import type { Service } from "@/features/bookings/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BookingForm({
  pets,
  services,
  action,
}: {
  pets: Pet[];
  services: Service[];
  action: (prevState: BookingActionState, formData: FormData) => Promise<BookingActionState>;
}) {
  const formId = useId();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      petId: "",
      serviceId: "",
      requestedDate: "",
      requestedTime: "",
      address: "",
      clientNotes: "",
    },
  });

  const petItems = Object.fromEntries(pets.map((pet) => [pet.id, pet.name]));
  const serviceItems = Object.fromEntries(
    services.map((service) => [
      service.id,
      service.duration_minutes ? `${service.name} (${service.duration_minutes} min)` : service.name,
    ]),
  );

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value ?? ""));

    const result = await action({}, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-petId`}>Mascota</Label>
        <Controller
          name="petId"
          control={control}
          render={({ field }) => (
            <Select items={petItems} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${formId}-petId`} className="w-full">
                <SelectValue placeholder="Selecciona una mascota" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.petId && <p className="text-sm text-destructive">{errors.petId.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-serviceId`}>Servicio</Label>
        <Controller
          name="serviceId"
          control={control}
          render={({ field }) => (
            <Select items={serviceItems} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${formId}-serviceId`} className="w-full">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                    {service.duration_minutes ? ` (${service.duration_minutes} min)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.serviceId && (
          <p className="text-sm text-destructive">{errors.serviceId.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-requestedDate`}>Fecha</Label>
          <Input id={`${formId}-requestedDate`} type="date" {...register("requestedDate")} />
          {errors.requestedDate && (
            <p className="text-sm text-destructive">{errors.requestedDate.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-requestedTime`}>Hora aproximada</Label>
          <Input id={`${formId}-requestedTime`} type="time" {...register("requestedTime")} />
          {errors.requestedTime && (
            <p className="text-sm text-destructive">{errors.requestedTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-address`}>Dirección o zona</Label>
        <Input id={`${formId}-address`} {...register("address")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-clientNotes`}>Observaciones para la cuidadora</Label>
        <Textarea id={`${formId}-clientNotes`} {...register("clientNotes")} />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar solicitud"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
