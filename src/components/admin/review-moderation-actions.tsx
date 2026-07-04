"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateReviewAction } from "@/features/reviews/actions";
import type { ReviewStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function ReviewModerationActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: ReviewStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setStatus = (next: ReviewStatus) =>
    startTransition(async () => {
      await moderateReviewAction(reviewId, next);
      router.refresh();
    });

  return (
    <div className="flex gap-2">
      {status !== "published" && (
        <Button size="sm" disabled={isPending} onClick={() => setStatus("published")}>
          Publicar
        </Button>
      )}
      {status !== "hidden" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setStatus("hidden")}>
          Ocultar
        </Button>
      )}
    </div>
  );
}
