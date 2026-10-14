import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
      <i className="bi bi-shield-lock display-1 text-danger" />
      <h3 className="mt-3">Access Denied</h3>
      <p className="text-muted mb-4">You don't have permission to view this page.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
