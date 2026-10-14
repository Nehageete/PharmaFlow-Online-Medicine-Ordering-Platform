import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import OrderTracker from "../../components/customer/OrderTracker";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { API_BASE_URL } from "../../services/api";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.trackOrder(orderId);
      setOrder(data);
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
        <Link to="/orders" className="text-decoration-none">
          <i className="bi bi-arrow-left me-1" /> Back to My Orders
        </Link>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Order #{order.orderId}</h4>
          <small className="text-muted">Placed on {formatDate(order.orderDate)}</small>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Order Status</h6>
          <OrderTracker status={order.status} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title mb-3">Items</h6>
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.orderItemId}>
                      <td>{item.medicineName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}>Total</th>
                    <th className="text-end">{formatCurrency(order.totalAmount)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title">Shipping Address</h6>
              <p className="mb-0 text-muted">{order.shippingAddress}</p>
            </div>
          </div>

          {order.payment && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title">Payment</h6>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Method</span>
                  <span>{order.payment.paymentMethod}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Status</span>
                  <StatusBadge status={order.payment.paymentStatus} />
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span>Amount</span>
                  <span>{formatCurrency(order.payment.amount)}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Transaction ID</span>
                    <span className="font-monospace">{order.payment.transactionId}</span>
                  </div>
                )}
                {order.payment.paymentStatus !== "SUCCESS" && (
                  <div className="mt-3 d-flex flex-column gap-2">
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => {
                        paymentService.displayRazorpayModal({
                          orderId: order.orderId,
                          onSuccess: () => {
                            notifySuccess("Payment Verified!");
                            load();
                          },
                          onError: (err) => notifyError(err || "Payment failed"),
                        });
                      }}
                    >
                      <i className="bi bi-credit-card me-1" /> Pay with Razorpay Gateway
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm w-100"
                      onClick={async () => {
                        try {
                          await paymentService.processPayment({
                            orderId: order.orderId,
                            paymentMethod: "ONLINE",
                          });
                          notifySuccess("Online Payment Completed Successfully!");
                          load();
                        } catch (err) {
                          notifyError(err.friendlyMessage || "Payment processing failed");
                        }
                      }}
                    >
                      <i className="bi bi-lightning-charge me-1" /> Quick Pay (Simulation)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {order.prescriptionPath && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Prescription</h6>
                <a
                  href={`${API_BASE_URL}/${order.prescriptionPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-file-earmark-medical me-1" />
                  View Uploaded Prescription
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
