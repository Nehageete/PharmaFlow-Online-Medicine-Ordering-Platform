import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/orderService";
import OrderCard from "../../components/customer/OrderCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getMyOrders();
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
    return (
      <EmptyState
        icon="bi-bag"
        title="You haven't placed any orders yet"
        action={<Link to="/medicines" className="btn btn-primary mt-2">Start Shopping</Link>}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">My Orders</h4>
      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </div>
  );
}
