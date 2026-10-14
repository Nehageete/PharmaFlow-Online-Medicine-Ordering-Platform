import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, getMedicineImageUrl } from "../../utils/formatters";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Wishlist() {
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await wishlistService.getWishlist();
      setItems(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (medicineId) => {
    try {
      await wishlistService.removeFromWishlist(medicineId);
      setItems((prev) => prev.filter((i) => i.medicineId !== medicineId));
    } catch (err) {
      notifyError(err.friendlyMessage);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await cartService.addToCart({ medicineId: item.medicineId, quantity: 1 });
      await refreshCart();
      notifySuccess(`${item.medicineName} added to cart`);
    } catch (err) {
      notifyError(err.friendlyMessage);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bi-heart"
        title="Your wishlist is empty"
        subtitle="Save medicines you're interested in for later."
        action={<Link to="/medicines" className="btn btn-primary mt-2">Browse Medicines</Link>}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">My Wishlist</h4>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {items.map((item) => (
          <div className="col" key={item.wishlistItemId}>
            <div className="card h-100 shadow-sm">
              <div className="row g-0">
                <div className="col-4">
                  <img
                    src={getMedicineImageUrl(item.medicineImage)}
                    alt={item.medicineName}
                    className="img-fluid rounded-start h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/medicine-placeholder.jpg";
                    }}
                  />
                </div>
                <div className="col-8">
                  <div className="card-body">
                    <Link to={`/medicines/${item.medicineId}`} className="text-decoration-none text-dark">
                      <h6 className="card-title">{item.medicineName}</h6>
                    </Link>
                    <p className="text-primary fw-bold mb-2">{formatCurrency(item.price)}</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => handleAddToCart(item)}>
                        <i className="bi bi-cart-plus" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(item.medicineId)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
