export default function Loader({ label = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <span className="mt-2 text-muted">{label}</span>
    </div>
  );
}
