import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, titleCase } from "../../utils/formatters";

const STATUS_VARIANTS = {
  PLACED: "info",
  CONFIRMED: "primary",
  PACKED: "secondary",
  OUT_FOR_DELIVERY: "warning",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getReportsSummary();
      setSummary(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Building reports..." />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!summary) return null;

  const ordersByStatus = summary.ordersByStatus || {};
  const totalOrders = Object.values(ordersByStatus).reduce((sum, count) => sum + Number(count), 0);
  const topSelling = summary.topSellingMedicines || [];
  const maxSold = Math.max(1, ...topSelling.map((m) => Number(m.totalQuantitySold)));
  const lowStock = summary.lowStockMedicines || [];

  return (
    <div>
      <h4 className="mb-4">Reports</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard icon="bi-cash-stack" label="Total Revenue" value={formatCurrency(summary.totalRevenue)} variant="success" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-bag-check" label="Total Orders" value={totalOrders} variant="info" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-exclamation-triangle" label="Low Stock Medicines" value={lowStock.length} variant="danger" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title mb-3">Orders by Status</h6>
              {Object.keys(ordersByStatus).length === 0 ? (
                <p className="text-muted mb-0">No orders yet.</p>
              ) : (
                Object.entries(ordersByStatus).map(([status, count]) => {
                  const pct = totalOrders ? Math.round((Number(count) / totalOrders) * 100) : 0;
                  return (
                    <div key={status} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{titleCase(status)}</span>
                        <span className="text-muted">{count} ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className={`progress-bar bg-${STATUS_VARIANTS[status] || "secondary"}`}
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title mb-3">Top Selling Medicines</h6>
              {topSelling.length === 0 ? (
                <p className="text-muted mb-0">No sales data yet.</p>
              ) : (
                topSelling.map((med) => {
                  const pct = Math.round((Number(med.totalQuantitySold) / maxSold) * 100);
                  return (
                    <div key={med.medicineId} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{med.medicineName}</span>
                        <span className="text-muted">{med.totalQuantitySold} sold</span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Low Stock Medicines</h6>
          {lowStock.length === 0 ? (
            <EmptyState icon="bi-check2-all" title="All stocked up" subtitle="No medicines are running low right now." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Stock Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((med) => (
                    <tr key={med.medicineId}>
                      <td>{med.name}</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger-emphasis">{med.stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
