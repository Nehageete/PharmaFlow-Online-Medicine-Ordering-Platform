import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import adminService from "../../services/adminService";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { API_BASE_URL } from "../../services/api";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET /orders/{id} is owner-scoped to the customer who placed it (see
  // OrderServiceImpl.trackOrder), so an admin can't call it directly. We
  // reuse the same status-aggregate used on the Orders list to find this order.
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const orders = await adminService.getAllOrders();
      const found = orders.find((o) => String(o.orderId) === String(orderId));
      if (!found) {
        setError("Order not found.");
      } else {
        setOrder(found);
      }
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <div>
      <nav className="mb-3">
        <Link to="/admin/orders" className="text-decoration-none">
          <i className="bi bi-arrow-left me-1" /> Back to Orders
        </Link>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Order #{order.orderId}</h4>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-muted">Placed on {formatDate(order.orderDate)}</p>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title mb-3">Items</h6>
              <table className="table table-sm">
                <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th></tr></thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.orderItemId}>
                      <td>{item.medicineName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-end fw-bold">Total: {formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Shipping Address</h6>
              <p className="text-muted mb-0">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          {order.payment && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title">Payment</h6>
                <div className="d-flex justify-content-between small mb-1"><span>Method</span><span>{order.payment.paymentMethod}</span></div>
                <div className="d-flex justify-content-between small mb-1"><span>Status</span><StatusBadge status={order.payment.paymentStatus} /></div>
                <div className="d-flex justify-content-between small"><span>Amount</span><span>{formatCurrency(order.payment.amount)}</span></div>
              </div>
            </div>
          )}
          {order.prescriptionPath && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Prescription</h6>
                <a href={`${API_BASE_URL}/${order.prescriptionPath}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-file-earmark-medical me-1" /> View Uploaded Prescription
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
