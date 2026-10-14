import { useEffect, useState } from "react";
import medicineService from "../../services/medicineService";
import categoryService from "../../services/categoryService";
import MedicineFormModal from "../../components/admin/MedicineFormModal";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatCurrency } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState({ show: false, medicine: null });
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [meds, cats] = await Promise.all([medicineService.getAll(), categoryService.getAll()]);
      setMedicines(meds);
      setCategories(cats);
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
      if (formState.medicine) {
        const updated = await medicineService.update(formState.medicine.medicineId, data);
        setMedicines((prev) => prev.map((m) => (m.medicineId === updated.medicineId ? updated : m)));
        notifySuccess("Medicine updated");
      } else {
        const created = await medicineService.create(data);
        setMedicines((prev) => [created, ...prev]);
        notifySuccess("Medicine added");
      }
      setFormState({ show: false, medicine: null });
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await medicineService.remove(pendingDelete.medicineId);
      setMedicines((prev) => prev.filter((m) => m.medicineId !== pendingDelete.medicineId));
      notifySuccess("Medicine deleted");
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  const filtered = medicines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h4 className="mb-0">Medicines</h4>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary text-nowrap" onClick={() => setFormState({ show: true, medicine: null })}>
            <i className="bi bi-plus-lg me-1" /> Add Medicine
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rx</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med) => (
              <tr key={med.medicineId}>
                <td>{med.name}<div className="text-muted small">{med.brand}</div></td>
                <td>{med.categoryName}</td>
                <td>{formatCurrency(med.price)}</td>
                <td className={med.stock <= 10 ? "text-danger fw-semibold" : ""}>{med.stock}</td>
                <td>{med.prescriptionRequired ? <span className="badge bg-warning text-dark">Rx</span> : "-"}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setFormState({ show: true, medicine: med })}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setPendingDelete(med)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MedicineFormModal
        show={formState.show}
        medicine={formState.medicine}
        categories={categories}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setFormState({ show: false, medicine: null })}
      />

      <ConfirmModal
        show={!!pendingDelete}
        title="Delete Medicine"
        message={`Delete "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
