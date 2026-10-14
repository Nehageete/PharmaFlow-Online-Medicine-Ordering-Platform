import { NavLink } from "react-router-dom";

// Generic sidebar used by both the Admin and Pharmacist layouts.
// items: [{ to, icon, label }]
export default function DashboardSidebar({ title, items }) {
  return (
    <aside className="bg-white border-end vh-lg-100" style={{ minWidth: "230px" }}>
      <div className="p-3 border-bottom">
        <span className="fw-bold text-primary">
          <i className="bi bi-capsule-pill me-2" />
          {title}
        </span>
      </div>
      <ul className="nav flex-column p-2">
        {items.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 rounded px-3 py-2 mb-1 ${
                  isActive ? "bg-primary text-white" : "text-dark"
                }`
              }
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
