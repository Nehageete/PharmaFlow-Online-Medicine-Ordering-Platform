const STEPS = ["PLACED", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

// Visual step tracker for a customer's order. If the order was CANCELLED,
// we show that as a distinct terminal state rather than forcing it onto the timeline.
export default function OrderTracker({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <i className="bi bi-x-circle-fill" />
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="d-flex justify-content-between position-relative my-4">
      <div
        className="position-absolute top-50 start-0 end-0 bg-light"
        style={{ height: "4px", zIndex: 0 }}
      />
      <div
        className="position-absolute top-50 start-0 bg-success"
        style={{
          height: "4px",
          zIndex: 1,
          width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          transition: "width .3s ease",
        }}
      />
      {STEPS.map((step, idx) => (
        <div key={step} className="text-center position-relative" style={{ zIndex: 2, flex: 1 }}>
          <div
            className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${
              idx <= currentIndex ? "bg-success text-white" : "bg-light text-muted border"
            }`}
            style={{ width: "32px", height: "32px" }}
          >
            {idx < currentIndex ? <i className="bi bi-check" /> : idx + 1}
          </div>
          <small className={`d-block mt-1 ${idx <= currentIndex ? "fw-semibold" : "text-muted"}`}>
            {step.replaceAll("_", " ")}
          </small>
        </div>
      ))}
    </div>
  );
}
