const STATUS_STYLES = {
  PLACED: "bg-info-subtle text-info-emphasis",
  CONFIRMED: "bg-primary-subtle text-primary-emphasis",
  PACKED: "bg-secondary-subtle text-secondary-emphasis",
  OUT_FOR_DELIVERY: "bg-warning-subtle text-warning-emphasis",
  DELIVERED: "bg-success-subtle text-success-emphasis",
  CANCELLED: "bg-danger-subtle text-danger-emphasis",
  PENDING: "bg-warning-subtle text-warning-emphasis",
  SUCCESS: "bg-success-subtle text-success-emphasis",
  FAILED: "bg-danger-subtle text-danger-emphasis",
  REFUNDED: "bg-secondary-subtle text-secondary-emphasis",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-light text-dark";
  return (
    <span className={`badge rounded-pill ${style} px-3 py-2`}>
      {status?.replaceAll("_", " ")}
    </span>
  );
}
