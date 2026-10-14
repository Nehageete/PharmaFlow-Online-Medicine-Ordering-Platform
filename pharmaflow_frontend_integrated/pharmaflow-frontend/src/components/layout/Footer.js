export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-capsule-pill fs-5" />
          <span className="fw-semibold">PharmaFlow</span>
          <span className="text-secondary small">- your trusted online pharmacy</span>
        </div>
        <small className="text-secondary">
          &copy; {new Date().getFullYear()} PharmaFlow. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
