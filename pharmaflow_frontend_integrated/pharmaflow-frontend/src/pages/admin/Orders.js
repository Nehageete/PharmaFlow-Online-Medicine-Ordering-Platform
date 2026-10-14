import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import { ORDER_STATUSES } from "../../services/orderService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getAllOrders();
      setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Aggregating orders across every status..." />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  const filtered = statusFilter === "ALL" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">All Orders</h4>
        <select className="form-select" style={{ maxWidth: "220px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.orderId}>
                <td>#{order.orderId}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>{order.orderItems?.length || 0} item(s)</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>{order.payment?.paymentMethod || "-"}</td>
                <td><StatusBadge status={order.status} /></td>
                <td>
                  <Link to={`/admin/orders/${order.orderId}`} className="btn btn-sm btn-outline-primary">
                    View
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
