"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reviewFormSchema } from "@/features/reviews/schemas";
import { createReviewAction } from "@/features/reviews/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewFormValues = z.input<typeof reviewFormSchema>;

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const formId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { bookingId, rating: 5, comment: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("bookingId", values.bookingId);
    formData.set("rating", String(values.rating));
    formData.set("comment", values.comment ?? "");

    const result = await createReviewAction({}, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  });

  if (submitted) {
    return <p className="text-sm text-muted-foreground">¡Gracias por tu reseña!</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-rating`}>Puntuación</Label>
        <select
          id={`${formId}-rating`}
          className="w-fit rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          {...register("rating")}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)}
              {"☆".repeat(5 - n)}
            </option>
          ))}
        </select>
        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-comment`}>Comentario (opcional)</Label>
        <Textarea id={`${formId}-comment`} {...register("comment")} />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Enviando…" : "Dejar reseña"}
      </Button>
    </form>
  );
}
