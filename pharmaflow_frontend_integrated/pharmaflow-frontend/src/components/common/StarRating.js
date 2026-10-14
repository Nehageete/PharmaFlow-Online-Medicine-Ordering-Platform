export default function StarRating({ value = 0, onChange, size = "1rem" }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <span style={{ fontSize: size }}>
      {stars.map((star) => (
        <i
          key={star}
          role={interactive ? "button" : undefined}
          className={`bi ${star <= value ? "bi-star-fill text-warning" : "bi-star text-warning"} me-1`}
          style={interactive ? { cursor: "pointer" } : undefined}
          onClick={interactive ? () => onChange(star) : undefined}
        />
      ))}
    </span>
  );
}
