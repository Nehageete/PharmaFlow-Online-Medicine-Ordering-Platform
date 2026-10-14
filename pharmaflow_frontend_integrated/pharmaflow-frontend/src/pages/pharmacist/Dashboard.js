import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pharmacistService from "../../services/pharmacistService";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";

export default function PharmacistDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [placed, confirmed, packed, outForDelivery] = await Promise.all([
        pharmacistService.getOrdersByStatus("PLACED"),
        pharmacistService.getOrdersByStatus("CONFIRMED"),
        pharmacistService.getOrdersByStatus("PACKED"),
        pharmacistService.getOrdersByStatus("OUT_FOR_DELIVERY"),
      ]);
      setCounts({
        placed: placed.length,
        confirmed: confirmed.length,
        packed: packed.length,
        outForDelivery: outForDelivery.length,
      });
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  return (
    <div>
      <h4 className="mb-4">Pharmacist Dashboard</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon="bi-file-earmark-medical" label="Pending Prescriptions" value={counts.placed} variant="warning" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-check2-circle" label="Confirmed" value={counts.confirmed} variant="primary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-box-seam" label="Packed" value={counts.packed} variant="secondary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-truck" label="Out for Delivery" value={counts.outForDelivery} variant="info" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <Link to="/pharmacist/pending-prescriptions" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <i className="bi bi-file-earmark-medical fs-1 text-warning" />
                <div>
                  <h6 className="mb-1">Review Pending Prescriptions</h6>
                  <p className="text-muted small mb-0">Approve or reject newly placed orders.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-6">
          <Link to="/pharmacist/update-stock" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <i className="bi bi-boxes fs-1 text-primary" />
                <div>
                  <h6 className="mb-1">Update Medicine Stock</h6>
                  <p className="text-muted small mb-0">Keep inventory levels accurate.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
