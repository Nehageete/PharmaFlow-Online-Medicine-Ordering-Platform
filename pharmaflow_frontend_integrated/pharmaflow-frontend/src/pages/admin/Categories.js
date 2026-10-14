import { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ConfirmModal from "../../components/common/ConfirmModal";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({ show: false, category: null });
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (formState.category) {
        const updated = await categoryService.update(formState.category.categoryId, data);
        setCategories((prev) => prev.map((c) => (c.categoryId === updated.categoryId ? updated : c)));
        notifySuccess("Category updated");
      } else {
        const created = await categoryService.create(data);
        setCategories((prev) => [created, ...prev]);
        notifySuccess("Category added");
      }
      setFormState({ show: false, category: null });
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryService.remove(pendingDelete.categoryId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== pendingDelete.categoryId));
      notifySuccess("Category deleted");
    } catch (err) {
      // Backend returns 400 if medicines still reference this category - surface that clearly.
      notifyError(err.friendlyMessage);
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Categories</h4>
        <button className="btn btn-primary" onClick={() => setFormState({ show: true, category: null })}>
          <i className="bi bi-plus-lg me-1" /> Add Category
        </button>
      </div>

      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3">
        {categories.map((cat) => (
          <div className="col" key={cat.categoryId}>
            <div className="card shadow-sm h-100">
              <img
                src={cat.image || "https://placehold.co/200x120?text=Category"}
                alt={cat.categoryName}
                className="card-img-top"
                style={{ height: "110px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{cat.categoryName}</h6>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => setFormState({ show: true, category: cat })}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setPendingDelete(cat)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CategoryFormModal
        show={formState.show}
        category={formState.category}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setFormState({ show: false, category: null })}
      />

      <ConfirmModal
        show={!!pendingDelete}
        title="Delete Category"
        message={`Delete "${pendingDelete?.categoryName}"? This will fail if medicines are still assigned to it.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
