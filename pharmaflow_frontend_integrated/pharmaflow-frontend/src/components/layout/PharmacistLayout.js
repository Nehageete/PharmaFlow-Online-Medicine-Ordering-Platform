import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import useAuth from "../../hooks/useAuth";

const PHARMACIST_NAV_ITEMS = [
  { to: "/pharmacist/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/pharmacist/pending-prescriptions", icon: "bi-file-earmark-medical", label: "Pending Prescriptions" },
  { to: "/pharmacist/update-stock", icon: "bi-boxes", label: "Update Stock" },
  { to: "/pharmacist/orders", icon: "bi-truck", label: "Update Order Status" },
];

export default function PharmacistLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="d-flex min-vh-100">
      <DashboardSidebar title="Pharmacist Panel" items={PHARMACIST_NAV_ITEMS} />
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
