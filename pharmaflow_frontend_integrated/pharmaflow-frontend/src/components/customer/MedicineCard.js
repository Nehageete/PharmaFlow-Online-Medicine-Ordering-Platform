import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../../context/CartContext";
import cartService from "../../services/cartService";
import useAuth from "../../hooks/useAuth";
import { formatCurrency, getMedicineImageUrl } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function MedicineCard({ medicine, onAddToCart, onToggleWishlist, isWishlisted }) {
  const { cartItems, refreshCart } = useCart();
  const { isAuthenticated, hasRole } = useAuth();
  const [updating, setUpdating] = useState(false);

  const outOfStock = medicine.stock <= 0;

  // Check if this medicine is already in the cart
  const cartItem = cartItems?.find(
    (item) => Number(item.medicineId) === Number(medicine.medicineId)
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = async () => {
    if (isAuthenticated && !hasRole("CUSTOMER")) {
      return notifyError("Only customers can shop for medicines.");
    }
    if (outOfStock) return;

    if (onAddToCart) {
      onAddToCart(medicine);
      return;
    }

    setUpdating(true);
    try {
      await cartService.addToCart({ medicineId: medicine.medicineId, quantity: 1 });
      await refreshCart();
      notifySuccess(`${medicine.name} added to cart`);
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not add item to cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if (isAuthenticated && !hasRole("CUSTOMER")) {
      return notifyError("Only customers can shop for medicines.");
    }
    if (!cartItem) return handleAdd();
    if (cartQuantity >= medicine.stock) {
      return notifyError(`Only ${medicine.stock} units available in stock`);
    }

    setUpdating(true);
    try {
      await cartService.updateQuantity(cartItem.cartItemId, cartQuantity + 1);
      await refreshCart();
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not increase quantity");
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (isAuthenticated && !hasRole("CUSTOMER")) {
      return notifyError("Only customers can shop for medicines.");
    }
    if (!cartItem) return;

    setUpdating(true);
    try {
      if (cartQuantity <= 1) {
        await cartService.removeFromCart(cartItem.cartItemId);
        await refreshCart();
        notifySuccess(`${medicine.name} removed from cart`);
      } else {
        await cartService.updateQuantity(cartItem.cartItemId, cartQuantity - 1);
        await refreshCart();
      }
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not decrease quantity");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm medicine-card">
      <div className="position-relative">
        <img
          src={getMedicineImageUrl(medicine.image)}
          alt={medicine.name}
          className="card-img-top"
          style={{ height: "180px", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/medicine-placeholder.jpg";
          }}
        />
        {medicine.prescriptionRequired && (
          <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">
            Rx Required
          </span>
        )}
        {onToggleWishlist && (
          <button
            className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2"
            onClick={() => onToggleWishlist(medicine)}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={`bi ${isWishlisted ? "bi-heart-fill text-danger" : "bi-heart"}`} />
          </button>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <Link to={`/medicines/${medicine.medicineId}`} className="text-decoration-none text-dark">
          <h6 className="card-title mb-1">{medicine.name}</h6>
        </Link>
        <p className="text-muted small mb-2">{medicine.brand}</p>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-primary">{formatCurrency(medicine.price)}</span>
          <span className={`small ${outOfStock ? "text-danger" : "text-success"}`}>
            {outOfStock ? "Out of stock" : `${medicine.stock} in stock`}
          </span>
        </div>
        <div className="mt-auto d-flex gap-2">
          <Link to={`/medicines/${medicine.medicineId}`} className="btn btn-outline-primary btn-sm flex-grow-1">
            View
          </Link>
          {cartQuantity > 0 ? (
            <div className="btn-group btn-group-sm flex-grow-1 shadow-sm" role="group" aria-label="Quantity selector">
              <button
                type="button"
                className="btn btn-outline-primary px-2 d-flex align-items-center justify-content-center"
                disabled={updating}
                onClick={handleDecrement}
                title="Decrease quantity"
              >
                <i className="bi bi-dash fw-bold" />
              </button>
              <span
                className="btn btn-primary px-2 fw-bold text-white d-flex align-items-center justify-content-center"
                style={{ minWidth: "36px", pointerEvents: "none", userSelect: "none" }}
              >
                {updating ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  cartQuantity
                )}
              </span>
              <button
                type="button"
                className="btn btn-outline-primary px-2 d-flex align-items-center justify-content-center"
                disabled={updating || cartQuantity >= medicine.stock}
                onClick={handleIncrement}
                title={cartQuantity >= medicine.stock ? "Maximum stock reached" : "Increase quantity"}
              >
                <i className="bi bi-plus fw-bold" />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm flex-grow-1"
              disabled={outOfStock || updating}
              onClick={handleAdd}
            >
              {updating ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
              ) : (
                <i className="bi bi-cart-plus me-1" />
              )}
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

