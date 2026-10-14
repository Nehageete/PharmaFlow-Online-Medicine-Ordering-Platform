import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import orderService from "../../services/orderService";
import pharmacistService from "../../services/pharmacistService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function PrescriptionReview() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // "approve" | "reject"
  const [submitting, setSubmitting] = useState(false);
  const [prescription, setPrescription] = useState(null); // { blobUrl, contentType }
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");

  // Pharmacists/Admins reach individual orders through the by-status queue
  // (GET /orders/status/{status}) since there is no GET /orders/{id} for
  // non-owners - trackOrder is owner-scoped. We locate this order within the
  // PLACED queue instead.
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const placedOrders = await orderService.getOrdersByStatus("PLACED");
      const found = placedOrders.find((o) => String(o.orderId) === String(orderId));
      if (!found) {
        setError("This order is no longer awaiting review (it may have already been processed).");
      } else {
        setOrder(found);
        if (found.prescriptionPath) {
          loadPrescription();
        }
      }
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // GET /orders/{orderId}/prescription requires the JWT Authorization header, so it's
  // fetched as a blob through the authenticated api instance rather than a plain <a href>.
  const loadPrescription = async () => {
    setPrescriptionLoading(true);
    setPrescriptionError("");
    try {
      const file = await orderService.getPrescriptionFile(orderId);
      setPrescription(file);
    } catch (err) {
      setPrescriptionError(err.friendlyMessage || "Could not load the prescription file.");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Revoke the blob URL whenever it changes or the component unmounts, to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (prescription?.blobUrl) {
        URL.revokeObjectURL(prescription.blobUrl);
      }
    };
  }, [prescription]);

  const confirmAction = async () => {
    setSubmitting(true);
    try {
      await pharmacistService.reviewPrescription(orderId, pendingAction === "approve");
      notifySuccess(pendingAction === "approve" ? "Order confirmed" : "Order rejected");
      navigate("/pharmacist/pending-prescriptions");
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <div>
      <nav className="mb-3">
        <Link to="/pharmacist/pending-prescriptions" className="text-decoration-none">
          <i className="bi bi-arrow-left me-1" /> Back to Pending Prescriptions
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
                <thead>
                  <tr><th>Medicine</th><th>Qty</th><th>Price</th></tr>
                </thead>
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
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title mb-3">Prescription</h6>
              {!order.prescriptionPath ? (
                <p className="text-muted mb-0">No prescription was required for this order.</p>
              ) : prescriptionLoading ? (
                <Loader label="Loading prescription..." />
              ) : prescriptionError ? (
                <ErrorAlert message={prescriptionError} onRetry={loadPrescription} />
              ) : prescription ? (
                <>
                  {prescription.contentType?.startsWith("image/") ? (
                    <img
                      src={prescription.blobUrl}
                      alt="Uploaded prescription"
                      className="img-fluid rounded border mb-2"
                    />
                  ) : prescription.contentType === "application/pdf" ? (
                    <iframe
                      src={prescription.blobUrl}
                      title="Uploaded prescription"
                      className="w-100 border rounded mb-2"
                      style={{ height: "400px" }}
                    />
                  ) : null}
                  <a
                    href={prescription.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary w-100"
                  >
                    <i className="bi bi-box-arrow-up-right me-2" />
                    Open in New Tab
                  </a>
                </>
              ) : null}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body d-flex gap-2">
              <button className="btn btn-success flex-grow-1" onClick={() => setPendingAction("approve")}>
                <i className="bi bi-check2-circle me-1" /> Approve
              </button>
              <button className="btn btn-danger flex-grow-1" onClick={() => setPendingAction("reject")}>
                <i className="bi bi-x-circle me-1" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={!!pendingAction}
        title={pendingAction === "approve" ? "Approve Order" : "Reject Order"}
        message={
          pendingAction === "approve"
            ? "Confirm this order? The customer will be notified it's being prepared."
            : "Reject this order? Reserved stock will be released back to inventory."
        }
        confirmLabel={pendingAction === "approve" ? "Approve" : "Reject"}
        confirmVariant={pendingAction === "approve" ? "success" : "danger"}
        onConfirm={confirmAction}
        onCancel={() => !submitting && setPendingAction(null)}
      />
    </div>
  );
}
