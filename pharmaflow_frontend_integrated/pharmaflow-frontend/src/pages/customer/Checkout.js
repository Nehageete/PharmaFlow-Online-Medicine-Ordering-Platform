import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import cartService from "../../services/cartService";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import profileService from "../../services/profileService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/formatters";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionNeeded, setPrescriptionNeeded] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { shippingAddress: "", paymentMethod: "COD" },
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [items, prof] = await Promise.all([
        cartService.getCart(),
        profileService.getProfile().catch(() => null),
      ]);
      setCartItems(items);
      setUserProfile(prof);
      if (prof?.address) setValue("shippingAddress", prof.address);

      setPrescriptionNeeded(items.some((item) => item.prescriptionRequired));
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

  const total = cartItems.reduce((sum, i) => sum + Number(i.subtotal), 0);

  const onSubmit = async (data) => {
    if (prescriptionNeeded && !prescriptionFile) {
      notifyError("A prescription file is required for at least one item in your cart.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.placeOrder({
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        prescriptionFile,
      });

      await refreshCart();

      if (data.paymentMethod === "ONLINE") {
        notifySuccess("Order created! Opening Razorpay Payment Gateway...");
        paymentService.displayRazorpayModal({
          orderId: order.orderId,
          userDetails: userProfile ? { name: `${userProfile.firstName} ${userProfile.lastName}`, email: userProfile.email, phone: userProfile.phone } : null,
          onSuccess: () => {
            notifySuccess("Razorpay Payment Verified!");
            navigate(`/orders/${order.orderId}`);
          },
          onError: (errMsg) => {
            notifyError(errMsg || "Payment incomplete. You can pay anytime from Order Details.");
            navigate(`/orders/${order.orderId}`);
          },
        });
      } else {
        notifySuccess("Order placed successfully!");
        navigate(`/orders/${order.orderId}`);
      }
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="bi-bag-x"
        title="Your cart is empty"
        subtitle="Add items to your cart before checking out."
        action={<Link to="/medicines" className="btn btn-primary mt-2">Browse Medicines</Link>}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">Checkout</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title">Shipping Address</h6>
                <textarea
                  rows="3"
                  className={`form-control ${errors.shippingAddress ? "is-invalid" : ""}`}
                  {...register("shippingAddress", {
                    required: "Shipping address is required",
                    maxLength: { value: 255, message: "Max 255 characters" },
                  })}
                />
                {errors.shippingAddress && <div className="invalid-feedback">{errors.shippingAddress.message}</div>}
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title">Payment Method</h6>
                <div className="form-check">
                  <input className="form-check-input" type="radio" value="COD" id="cod" {...register("paymentMethod")} />
                  <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" value="ONLINE" id="online" {...register("paymentMethod")} />
                  <label className="form-check-label" htmlFor="online">Online Payment</label>
                </div>
              </div>
            </div>

            {prescriptionNeeded && (
              <div className="card shadow-sm mb-4 border-warning">
                <div className="card-body">
                  <h6 className="card-title text-warning-emphasis">
                    <i className="bi bi-file-earmark-medical me-2" />
                    Prescription Required
                  </h6>
                  <p className="text-muted small mb-2">
                    One or more items in your cart require a valid prescription. Upload a JPEG, PNG, WEBP image or PDF (max 5MB).
                  </p>
                  <input
                    type="file"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                  />
                  {!prescriptionFile && (
                    <div className="text-danger small mt-1">A prescription file is required to place this order.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">Order Summary</h6>
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="d-flex justify-content-between small mb-2">
                    <span>{item.medicineName} &times; {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
