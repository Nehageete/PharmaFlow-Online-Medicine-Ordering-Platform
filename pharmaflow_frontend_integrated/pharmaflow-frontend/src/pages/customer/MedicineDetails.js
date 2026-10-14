import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import medicineService from "../../services/medicineService";
import reviewService from "../../services/reviewService";
import cartService from "../../services/cartService";
import wishlistService from "../../services/wishlistService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ReviewList from "../../components/customer/ReviewList";
import ReviewForm from "../../components/customer/ReviewForm";
import StarRating from "../../components/common/StarRating";
import { formatCurrency, formatDateOnly, getMedicineImageUrl } from "../../utils/formatters";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function MedicineDetails() {
  const { medicineId } = useParams();
  const { isAuthenticated, hasRole } = useAuth();
  const { refreshCart } = useCart();

  const [medicine, setMedicine] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [med, medReviews] = await Promise.all([
        medicineService.getById(medicineId),
        reviewService.getForMedicine(medicineId),
      ]);
      setMedicine(med);
      setReviews(medReviews);

      const wishlist = await wishlistService.getWishlist().catch(() => []);
      setIsWishlisted(wishlist.some((w) => w.medicineId === Number(medicineId)));
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicineId]);

  const handleAddToCart = async () => {
    if (isAuthenticated && !hasRole("CUSTOMER")) return notifyError("Only customers can shop for medicines.");
    try {
      await cartService.addToCart({ medicineId: medicine.medicineId, quantity });
      await refreshCart();
      notifySuccess(`${medicine.name} added to cart`);
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not add item to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (isAuthenticated && !hasRole("CUSTOMER")) return notifyError("Only customers can use wishlist.");
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(medicine.medicineId);
        setIsWishlisted(false);
        notifySuccess("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(medicine.medicineId);
        setIsWishlisted(true);
        notifySuccess("Added to wishlist");
      }
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not update wishlist");
    }
  };

  const handleReviewSubmit = async (data, onDone) => {
    if (!isAuthenticated) return notifyError("Please log in to write a review.");
    if (!hasRole("CUSTOMER")) return notifyError("Only customers can write reviews.");
    setSubmittingReview(true);
    try {
      await reviewService.addReview({ medicineId: Number(medicineId), ...data });
      notifySuccess("Thanks for your review!");
      const updated = await reviewService.getForMedicine(medicineId);
      setReviews(updated);
      onDone();
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={loadData} />;
  if (!medicine) return null;

  const outOfStock = medicine.stock <= 0;

  return (
    <div>
      <nav className="mb-3">
        <Link to="/medicines" className="text-decoration-none">
          <i className="bi bi-arrow-left me-1" /> Back to Medicines
        </Link>
      </nav>

      <div className="row g-4">
        <div className="col-md-5">
          <img
            src={getMedicineImageUrl(medicine.image)}
            alt={medicine.name}
            className="img-fluid rounded-4 shadow-sm w-100"
            style={{ maxHeight: "420px", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/medicine-placeholder.jpg";
            }}
          />
        </div>
        <div className="col-md-7">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <span className="badge bg-light text-dark border mb-2">{medicine.categoryName}</span>
              <h2>{medicine.name}</h2>
              <p className="text-muted mb-1">{medicine.brand} &middot; {medicine.manufacturer}</p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <StarRating value={Math.round(avgRating)} />
                <span className="text-muted small">
                  {avgRating ? avgRating.toFixed(1) : "No ratings"} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
            <button
              className="btn btn-outline-secondary rounded-circle"
              onClick={handleToggleWishlist}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <i className={`bi ${isWishlisted ? "bi-heart-fill text-danger" : "bi-heart"}`} />
            </button>
          </div>

          {medicine.prescriptionRequired && (
            <div className="alert alert-warning py-2">
              <i className="bi bi-exclamation-triangle me-2" />
              This medicine requires a valid prescription at checkout.
            </div>
          )}

          <h3 className="text-primary mb-3">{formatCurrency(medicine.price)}</h3>

          <p>{medicine.description || "No description available."}</p>

          <table className="table table-sm w-auto">
            <tbody>
              <tr><th>Unit</th><td>{medicine.unit}</td></tr>
              <tr><th>Stock</th><td className={outOfStock ? "text-danger" : "text-success"}>{outOfStock ? "Out of stock" : `${medicine.stock} available`}</td></tr>
              {medicine.expiryDate && <tr><th>Expiry</th><td>{formatDateOnly(medicine.expiryDate)}</td></tr>}
            </tbody>
          </table>

          <div className="d-flex align-items-center gap-3 mt-3">
            <div className="input-group" style={{ width: "130px" }}>
              <button className="btn btn-outline-secondary" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>-</button>
              <input className="form-control text-center" value={quantity} readOnly />
              <button className="btn btn-outline-secondary" disabled={quantity >= medicine.stock} onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <button className="btn btn-primary flex-grow-1" disabled={outOfStock} onClick={handleAddToCart}>
              <i className="bi bi-cart-plus me-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <div className="row g-4">
        <div className="col-md-7">
          <h5 className="mb-3">Customer Reviews</h5>
          <ReviewList reviews={reviews} />
        </div>
        <div className="col-md-5">
          <ReviewForm onSubmit={handleReviewSubmit} submitting={submittingReview} />
        </div>
      </div>
    </div>
  );
}
