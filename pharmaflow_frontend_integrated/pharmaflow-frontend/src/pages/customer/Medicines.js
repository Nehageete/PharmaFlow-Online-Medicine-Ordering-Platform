import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import medicineService from "../../services/medicineService";
import categoryService from "../../services/categoryService";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";
import MedicineCard from "../../components/customer/MedicineCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Medicines() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, hasRole } = useAuth();
  const { refreshCart } = useCart();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("name") || "");

  const name = searchParams.get("name");
  const categoryId = searchParams.get("categoryId");

  const loadMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (name) {
        data = await medicineService.search(name);
      } else if (categoryId) {
        data = await medicineService.getByCategory(categoryId);
      } else {
        data = await medicineService.getAll();
      }
      setMedicines(data);

      const wishlist = await wishlistService.getWishlist().catch(() => []);
      setWishlistIds(new Set(wishlist.map((w) => w.medicineId)));
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, categoryId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchParams(trimmed ? { name: trimmed } : {});
  };

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

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Medicines</h4>
        <form onSubmit={handleSearch} className="d-flex" style={{ minWidth: "260px" }}>
          <input
            className="form-control"
            placeholder="Search medicines..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary ms-2" type="submit">
            <i className="bi bi-search" />
          </button>
        </form>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${!categoryId ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setSearchParams({})}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            className={`btn btn-sm ${String(categoryId) === String(cat.categoryId) ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setSearchParams({ categoryId: cat.categoryId })}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorAlert message={error} onRetry={loadMedicines} />}
      {!loading && !error && medicines.length === 0 && (
        <EmptyState icon="bi-capsule" title="No medicines found" subtitle="Try a different search or category." />
      )}
      {!loading && !error && medicines.length > 0 && (
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
      )}
    </div>
  );
}
