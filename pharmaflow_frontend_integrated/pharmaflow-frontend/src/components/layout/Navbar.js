import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/medicines?name=${encodeURIComponent(q)}` : "/medicines");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <i className="bi bi-capsule-pill fs-4" />
          PharmaFlow
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/medicines">Medicines</Link>
            </li>
          </ul>

          <form className="d-flex me-3 my-2 my-lg-0" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: "220px" }}
            />
            <button className="btn btn-sm btn-light ms-2" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>

          <ul className="navbar-nav align-items-lg-center gap-lg-2 ms-auto">
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/wishlist" title="Wishlist">
                <i className="bi bi-heart fs-5" />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/cart" title="Cart">
                <i className="bi bi-cart3 fs-5" />
                {itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>

            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle text-white"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1" />
                  {user?.firstName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex gap-2 ms-lg-2">
                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                <Link className="btn btn-light btn-sm" to="/register">Register</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
