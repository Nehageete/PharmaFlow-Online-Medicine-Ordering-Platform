import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pharmacistService from "../../services/pharmacistService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function PendingPrescriptions() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await pharmacistService.getPendingPrescriptions();
      setOrders(data);
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

  if (orders.length === 0) {
    return <EmptyState icon="bi-check2-all" title="No pending prescriptions" subtitle="You're all caught up." />;
  }

  return (
    <div>
      <h4 className="mb-4">Pending Prescriptions</h4>
      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Prescription</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>#{order.orderId}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>{order.orderItems.length} item(s)</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  {order.prescriptionPath ? (
                    <span className="badge bg-success-subtle text-success-emphasis">Uploaded</span>
                  ) : (
                    <span className="badge bg-light text-muted">Not required</span>
                  )}
                </td>
                <td>
                  <Link to={`/pharmacist/pending-prescriptions/${order.orderId}`} className="btn btn-sm btn-primary">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
