export default function StatCard({ icon, label, value, variant = "primary" }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body d-flex align-items-center gap-3">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center bg-${variant}-subtle text-${variant}-emphasis`}
          style={{ width: "48px", height: "48px" }}
        >
          <i className={`bi ${icon} fs-4`} />
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fs-4 fw-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
