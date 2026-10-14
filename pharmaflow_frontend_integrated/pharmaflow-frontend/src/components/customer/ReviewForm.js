import { useState } from "react";
import { useForm } from "react-hook-form";
import StarRating from "../common/StarRating";

export default function ReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, reset } = useForm();

  const submit = (data) => {
    if (rating === 0) return;
    onSubmit({ rating, comment: data.comment }, () => {
      reset();
      setRating(0);
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="border rounded p-3">
      <h6 className="mb-2">Write a review</h6>
      <div className="mb-2">
        <StarRating value={rating} onChange={setRating} size="1.4rem" />
        {rating === 0 && <div className="text-danger small mt-1">Select a star rating</div>}
      </div>
      <textarea
        className="form-control mb-2"
        rows="3"
        placeholder="Share your experience with this medicine..."
        {...register("comment")}
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
