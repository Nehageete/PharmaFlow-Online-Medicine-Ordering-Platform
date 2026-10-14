import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import useAuth from "../../hooks/useAuth";

const ADMIN_NAV_ITEMS = [
  { to: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/admin/users", icon: "bi-people", label: "Users" },
  { to: "/admin/medicines", icon: "bi-capsule", label: "Medicines" },
  { to: "/admin/categories", icon: "bi-tags", label: "Categories" },
  { to: "/admin/orders", icon: "bi-bag-check", label: "Orders" },
  { to: "/admin/payments", icon: "bi-credit-card", label: "Payments" },
  { to: "/admin/reports", icon: "bi-bar-chart-line", label: "Reports" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="d-flex min-vh-100">
      <DashboardSidebar title="Admin Panel" items={ADMIN_NAV_ITEMS} />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center">
          <span className="text-muted">Welcome back, {user?.firstName}</span>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right me-1" />
            Logout
          </button>
        </header>
        <main className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
