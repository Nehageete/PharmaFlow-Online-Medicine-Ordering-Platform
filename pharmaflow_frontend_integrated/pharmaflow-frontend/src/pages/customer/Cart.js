import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import CartItemRow from "../../components/customer/CartItemRow";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatCurrency } from "../../utils/formatters";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cartService.getCart();
      setItems(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(item.cartItemId);
    try {
      const updated = await cartService.updateQuantity(item.cartItemId, newQuantity);
      setItems((prev) => prev.map((i) => (i.cartItemId === item.cartItemId ? updated : i)));
      await refreshCart();
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      await cartService.removeFromCart(pendingRemove.cartItemId);
      setItems((prev) => prev.filter((i) => i.cartItemId !== pendingRemove.cartItemId));
      await refreshCart();
      notifySuccess("Item removed from cart");
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setPendingRemove(null);
    }
  };

  const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bi-cart-x"
        title="Your cart is empty"
        subtitle="Add some medicines to get started."
        action={<Link to="/medicines" className="btn btn-primary mt-2">Browse Medicines</Link>}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">My Cart</h4>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <CartItemRow
                    key={item.cartItemId}
                    item={item}
                    updating={updatingId === item.cartItemId}
                    onQuantityChange={handleQuantityChange}
                    onRemove={setPendingRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold mb-3">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <button className="btn btn-primary w-100" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={!!pendingRemove}
        title="Remove item"
        message={`Remove "${pendingRemove?.medicineName}" from your cart?`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
