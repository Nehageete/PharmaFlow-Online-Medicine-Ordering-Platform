import { useEffect, useState } from "react";
import medicineService from "../../services/medicineService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function UpdateStock() {
  const [medicines, setMedicines] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await medicineService.getAll();
      setMedicines(data);
      setDrafts(Object.fromEntries(data.map((m) => [m.medicineId, m.stock])));
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (medicineId) => {
    const newStock = parseInt(drafts[medicineId], 10);
    if (Number.isNaN(newStock) || newStock < 0) {
      return notifyError("Stock must be a non-negative number");
    }
    setSavingId(medicineId);
    try {
      const updated = await medicineService.updateStock(medicineId, newStock);
      setMedicines((prev) => prev.map((m) => (m.medicineId === medicineId ? updated : m)));
      notifySuccess(`Stock updated for ${updated.name}`);
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Update Stock</h4>
        <input
          className="form-control"
          style={{ maxWidth: "280px" }}
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>New Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med) => (
              <tr key={med.medicineId}>
                <td>{med.name}</td>
                <td>{med.categoryName}</td>
                <td>
                  <span className={med.stock <= 5 ? "text-danger fw-semibold" : ""}>{med.stock}</span>
                </td>
                <td style={{ maxWidth: "140px" }}>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-sm"
                    value={drafts[med.medicineId] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [med.medicineId]: e.target.value }))}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={savingId === med.medicineId || Number(drafts[med.medicineId]) === med.stock}
                    onClick={() => handleSave(med.medicineId)}
                  >
                    {savingId === med.medicineId ? "Saving..." : "Update"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
