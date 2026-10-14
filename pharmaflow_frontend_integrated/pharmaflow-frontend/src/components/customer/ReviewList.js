import StarRating from "../common/StarRating";
import { formatDateOnly } from "../../utils/formatters";

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-muted">No reviews yet. Be the first to review this medicine.</p>;
  }
  return (
    <div className="d-flex flex-column gap-3">
      {reviews.map((review) => (
        <div key={review.reviewId} className="border rounded p-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold">{review.userName}</span>
            <small className="text-muted">{formatDateOnly(review.reviewDate)}</small>
          </div>
          <StarRating value={review.rating} />
          {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}
