import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getPayments();
      setPayments(data.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Gathering payment records..." />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  const filtered = statusFilter === "ALL" ? payments : payments.filter((p) => p.paymentStatus === statusFilter);
  const totalCollected = filtered
    .filter((p) => p.paymentStatus === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Payments</h4>
        <select className="form-select" style={{ maxWidth: "220px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card shadow-sm mb-4 border-0 bg-success-subtle">
        <div className="card-body">
          <span className="text-muted small d-block">Total Collected (SUCCESS)</span>
          <span className="fs-4 fw-bold text-success-emphasis">{formatCurrency(totalCollected)}</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Transaction ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <tr key={payment.paymentId}>
                <td>#{payment.paymentId}</td>
                <td>#{payment.orderId}</td>
                <td>
                  <div>{payment.customerName}</div>
                  <div className="text-muted small">{payment.customerEmail}</div>
                </td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{payment.paymentMethod}</td>
                <td><StatusBadge status={payment.paymentStatus} /></td>
                <td className="text-muted small">{payment.transactionId || "-"}</td>
                <td>{formatDate(payment.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
