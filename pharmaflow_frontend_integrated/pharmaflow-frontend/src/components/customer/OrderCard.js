import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function OrderCard({ order }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
          <div>
            <h6 className="mb-1">Order #{order.orderId}</h6>
            <small className="text-muted">{formatDate(order.orderDate)}</small>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            {order.orderItems?.length || 0} item(s) &middot; {formatCurrency(order.totalAmount)}
          </span>
          <Link to={`/orders/${order.orderId}`} className="btn btn-sm btn-outline-primary">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
