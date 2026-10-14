import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import medicineService from "../../services/medicineService";
import categoryService from "../../services/categoryService";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatCurrency } from "../../utils/formatters";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [users, medicines, categories, orders] = await Promise.all([
        adminService.getAllUsers(),
        medicineService.getAll(),
        categoryService.getAll(),
        adminService.getAllOrders(),
      ]);
      const revenue = orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.totalAmount), 0);

      setStats({
        userCount: users.length,
        customerCount: users.filter((u) => u.role === "CUSTOMER").length,
        pharmacistCount: users.filter((u) => u.role === "PHARMACIST").length,
        medicineCount: medicines.length,
        lowStockCount: medicines.filter((m) => m.stock <= 10).length,
        categoryCount: categories.length,
        orderCount: orders.length,
        pendingCount: orders.filter((o) => o.status === "PLACED").length,
        revenue,
      });
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Crunching the numbers..." />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  return (
    <div>
      <h4 className="mb-4">Admin Dashboard</h4>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <StatCard icon="bi-people" label="Total Users" value={stats.userCount} variant="primary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-capsule" label="Medicines" value={stats.medicineCount} variant="success" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-tags" label="Categories" value={stats.categoryCount} variant="secondary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-bag-check" label="Total Orders" value={stats.orderCount} variant="info" />
        </div>
      </div>
      <div className="row g-3">
        <div className="col-md-3">
          <StatCard icon="bi-hourglass-split" label="Pending Prescriptions" value={stats.pendingCount} variant="warning" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-exclamation-triangle" label="Low Stock (&le;10)" value={stats.lowStockCount} variant="danger" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-person-badge" label="Customers / Pharmacists" value={`${stats.customerCount} / ${stats.pharmacistCount}`} variant="secondary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-cash-stack" label="Revenue (non-cancelled)" value={formatCurrency(stats.revenue)} variant="success" />
        </div>
      </div>
    </div>
  );
}
