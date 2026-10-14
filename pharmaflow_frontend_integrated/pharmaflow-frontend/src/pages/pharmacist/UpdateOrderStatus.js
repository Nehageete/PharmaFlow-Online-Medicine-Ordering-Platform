import { useEffect, useState } from "react";
import pharmacistService from "../../services/pharmacistService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

// Only statuses a pharmacist actively manages after prescription approval.
// PLACED lives on the "Pending Prescriptions" screen; DELIVERED/CANCELLED are terminal.
const TABS = ["CONFIRMED", "PACKED", "OUT_FOR_DELIVERY"];

const NEXT_STATUS = {
  CONFIRMED: "PACKED",
  PACKED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

export default function UpdateOrderStatus() {
  const [activeTab, setActiveTab] = useState("CONFIRMED");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await pharmacistService.getOrdersByStatus(status);
      setOrders(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAdvance = async (orderId) => {
    const nextStatus = NEXT_STATUS[activeTab];
    setUpdatingId(orderId);
    try {
      await pharmacistService.updateOrderStatus(orderId, nextStatus);
      notifySuccess(`Order #${orderId} moved to ${nextStatus.replaceAll("_", " ")}`);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Update Order Status</h4>

      <ul className="nav nav-pills mb-4">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replaceAll("_", " ")}
            </button>
          </li>
        ))}
      </ul>

      {loading && <Loader />}
      {!loading && error && <ErrorAlert message={error} onRetry={() => load(activeTab)} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState icon="bi-truck" title={`No orders in "${activeTab.replaceAll("_", " ")}"`} />
      )}
      {!loading && !error && orders.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
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
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={updatingId === order.orderId}
                      onClick={() => handleAdvance(order.orderId)}
                    >
                      {updatingId === order.orderId
                        ? "Updating..."
                        : `Move to ${NEXT_STATUS[activeTab].replaceAll("_", " ")}`}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
