import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import categoryService from "../../services/categoryService";
import medicineService from "../../services/medicineService";
import cartService from "../../services/cartService";
import wishlistService from "../../services/wishlistService";
import CategoryCard from "../../components/customer/CategoryCard";
import MedicineCard from "../../components/customer/MedicineCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Home() {
  const { isAuthenticated, hasRole } = useAuth();
  const { refreshCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, meds] = await Promise.all([
        categoryService.getAll(),
        medicineService.getAll(),
      ]);
      setCategories(cats);
      setMedicines(meds.slice(0, 8));

      if (isAuthenticated && hasRole("CUSTOMER")) {
        const wishlist = await wishlistService.getWishlist();
        setWishlistIds(new Set(wishlist.map((w) => w.medicineId)));
      }
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = async (medicine) => {
    if (isAuthenticated && !hasRole("CUSTOMER")) return notifyError("Only customers can shop for medicines.");
    try {
      await cartService.addToCart({ medicineId: medicine.medicineId, quantity: 1 });
      await refreshCart();
      notifySuccess(`${medicine.name} added to cart`);
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not add item to cart");
    }
  };

  const handleToggleWishlist = async (medicine) => {
    if (isAuthenticated && !hasRole("CUSTOMER")) return notifyError("Only customers can use wishlist.");
    try {
      if (wishlistIds.has(medicine.medicineId)) {
        await wishlistService.removeFromWishlist(medicine.medicineId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(medicine.medicineId);
          return next;
        });
        notifySuccess("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(medicine.medicineId);
        setWishlistIds((prev) => new Set(prev).add(medicine.medicineId));
        notifySuccess("Added to wishlist");
      }
    } catch (err) {
      notifyError(err.friendlyMessage || "Could not update wishlist");
    }
  };

  if (loading) return <Loader label="Loading PharmaFlow..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadData} />;

  return (
    <div>
      <div
        className="p-5 mb-4 text-white rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(2, 100, 51, 0.88), rgba(90, 135, 128, 0.92)), url(/images/hero-banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="fw-bold">Your Health, Delivered.</h1>
        <p className="lead mb-4">Genuine medicines, fast delivery, and licensed pharmacist support.</p>
        <Link to="/medicines" className="btn btn-light btn-lg">
          Shop Medicines
        </Link>
      </div>

      <h4 className="mb-3">Shop by Category</h4>
      <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3 mb-5">
        {categories.map((cat) => (
          <div className="col" key={cat.categoryId}>
            <CategoryCard category={cat} />
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Popular Medicines</h4>
        <Link to="/medicines" className="btn btn-sm btn-outline-primary">View All</Link>
      </div>
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
        {medicines.map((med) => (
          <div className="col" key={med.medicineId}>
            <MedicineCard
              medicine={med}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlistIds.has(med.medicineId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
