import { Badge } from "@/components/ui/badge";

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-fa-gold" aria-label={`${value} de 5 estrelas`}>
      {"★".repeat(Math.round(value))}
      <span className="text-fa-stone/40">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export interface ReviewListItem {
  id: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { name: string };
}

export function ReviewList({
  reviews,
  average,
  count,
}: {
  reviews: ReviewListItem[];
  average: number;
  count: number;
}) {
  if (reviews.length === 0) {
    return (
      <div className="border border-dashed border-fa-stone/40 py-10 text-center">
        <p className="text-sm text-fa-black/60">
          Ainda não há avaliações para este produto. Seja o primeiro a avaliar!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <StarRating value={average} />
        <span className="text-sm text-fa-black/70">
          {average.toFixed(1)} de 5 ({count} {count === 1 ? "avaliação" : "avaliações"})
        </span>
      </div>

      <ul className="mt-6 space-y-6">
        {reviews.map((review) => (
          <li key={review.id} className="border-b border-fa-stone/15 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <StarRating value={review.rating} />
              <span className="text-sm font-medium text-fa-black">{review.user.name}</span>
              {review.isVerifiedPurchase && (
                <Badge variant="success" className="normal-case">
                  Compra verificada
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-fa-black/70">{review.comment}</p>
            <p className="mt-1 text-xs text-fa-black/40">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(review.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
