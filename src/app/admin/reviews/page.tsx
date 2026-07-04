import { getAllReviews } from "@/features/reviews/queries";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS = { pending: "Pendiente", published: "Publicada", hidden: "Oculta" } as const;

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Reseñas</h1>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay reseñas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-2 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {review.profiles?.full_name} · {review.bookings?.pets?.name} ·{" "}
                    {review.bookings?.services?.name}
                  </p>
                </div>
                <Badge variant={review.status === "published" ? "default" : "outline"}>
                  {STATUS_LABELS[review.status]}
                </Badge>
              </div>
              {review.comment && <p>{review.comment}</p>}
              <ReviewModerationActions reviewId={review.id} status={review.status} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
