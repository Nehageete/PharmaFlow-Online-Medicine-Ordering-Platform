import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import StaffUserFormModal from "../../components/admin/StaffUserFormModal";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatDateOnly } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("CUSTOMER");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingToggle, setPendingToggle] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmToggle = async () => {
    const { userId, active } = pendingToggle;
    try {
      await adminService.setUserActiveStatus(userId, !active);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, active: !active } : u))
      );
      notifySuccess(!active ? "Account activated successfully" : "Account deactivated successfully");
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setPendingToggle(null);
    }
  };

  const handleCreateStaff = async (data) => {
    setCreating(true);
    try {
      const created = await adminService.createStaffUser(data);
      setUsers((prev) => [created, ...prev]);
      notifySuccess(
        `${created.role === "ADMIN" ? "Admin" : "Pharmacist"} account created for ${created.email}`
      );
      setShowCreateForm(false);
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  const customerUsers = users.filter((u) => u.role === "CUSTOMER");
  const pharmacistUsers = users.filter((u) => u.role === "PHARMACIST");
  const adminUsers = users.filter((u) => u.role === "ADMIN");

  const currentTabUsers =
    activeTab === "CUSTOMER"
      ? customerUsers
      : activeTab === "PHARMACIST"
      ? pharmacistUsers
      : adminUsers;

  const filteredUsers = currentTabUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div>
      {/* Header & Add Button */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="mb-1">User Management</h4>
          <p className="text-muted small mb-0">
            Manage customer accounts, pharmacists, and system administrators.
          </p>
        </div>
        <button
          className="btn btn-primary text-nowrap shadow-sm"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="bi bi-person-plus me-1" /> Add Staff / Pharmacist
        </button>
      </div>

      {/* Distinct Category Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <ul className="nav nav-pills" role="tablist">
            <li className="nav-item me-2" role="presentation">
              <button
                className={`nav-link px-3 py-2 fw-semibold ${
                  activeTab === "CUSTOMER" ? "active bg-primary text-white" : "text-dark"
                }`}
                onClick={() => {
                  setActiveTab("CUSTOMER");
                  setSearchQuery("");
                }}
              >
                <i className="bi bi-people me-2" />
                Consumers & Customers
                <span
                  className={`badge ms-2 rounded-pill ${
                    activeTab === "CUSTOMER" ? "bg-white text-primary" : "bg-secondary-subtle text-dark"
                  }`}
                >
                  {customerUsers.length}
                </span>
              </button>
            </li>
            <li className="nav-item me-2" role="presentation">
              <button
                className={`nav-link px-3 py-2 fw-semibold ${
                  activeTab === "PHARMACIST" ? "active bg-primary text-white" : "text-dark"
                }`}
                onClick={() => {
                  setActiveTab("PHARMACIST");
                  setSearchQuery("");
                }}
              >
                <i className="bi bi-hospital me-2" />
                Pharmacists
                <span
                  className={`badge ms-2 rounded-pill ${
                    activeTab === "PHARMACIST" ? "bg-white text-primary" : "bg-secondary-subtle text-dark"
                  }`}
                >
                  {pharmacistUsers.length}
                </span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link px-3 py-2 fw-semibold ${
                  activeTab === "ADMIN" ? "active bg-primary text-white" : "text-dark"
                }`}
                onClick={() => {
                  setActiveTab("ADMIN");
                  setSearchQuery("");
                }}
              >
                <i className="bi bi-shield-lock me-2" />
                Administrators
                <span
                  className={`badge ms-2 rounded-pill ${
                    activeTab === "ADMIN" ? "bg-white text-primary" : "bg-secondary-subtle text-dark"
                  }`}
                >
                  {adminUsers.length}
                </span>
              </button>
            </li>
          </ul>

          {/* Quick Search */}
          <div className="d-flex align-items-center" style={{ minWidth: "240px" }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={`Search ${
                  activeTab === "CUSTOMER"
                    ? "customers"
                    : activeTab === "PHARMACIST"
                    ? "pharmacists"
                    : "admins"
                }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Safety Banner (Only in Administrators Tab) */}
      {activeTab === "ADMIN" && (
        <div className="alert alert-success d-flex align-items-center py-2 px-3 mb-3 border-0 bg-success-subtle text-success-emphasis rounded-3">
          <i className="bi bi-shield-check fs-5 me-2" />
          <div className="small">
            <strong>Protected Accounts:</strong> System Administrator accounts have full administrative
            privileges and cannot be deactivated from the management console.
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="table-responsive bg-white shadow-sm rounded-3">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 ps-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Phone</th>
              {activeTab === "CUSTOMER" && <th className="py-3">Address</th>}
              <th className="py-3">Role</th>
              <th className="py-3">Joined Date</th>
              <th className="py-3">Status</th>
              {activeTab !== "ADMIN" && <th className="py-3 text-end pe-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "CUSTOMER" ? 8 : activeTab === "ADMIN" ? 6 : 7}
                  className="text-center py-5 text-muted"
                >
                  <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary opacity-50" />
                  No {activeTab.toLowerCase()} records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td className="ps-3 fw-semibold">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}
                      >
                        {(user.firstName || "U")[0]}
                      </div>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || <span className="text-muted">-</span>}</td>
                  {activeTab === "CUSTOMER" && (
                    <td style={{ maxWidth: "200px" }} className="text-truncate">
                      {user.address || <span className="text-muted">-</span>}
                    </td>
                  )}
                  <td>
                    <span
                      className={`badge border ${
                        user.role === "ADMIN"
                          ? "bg-dark text-white border-dark"
                          : user.role === "PHARMACIST"
                          ? "bg-info-subtle text-info-emphasis border-info-subtle"
                          : "bg-light text-dark"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDateOnly(user.createdAt)}</td>
                  <td>
                    <span
                      className={`badge px-2 py-1 ${
                        user.active
                          ? "bg-success-subtle text-success-emphasis border border-success-subtle"
                          : "bg-danger-subtle text-danger-emphasis border border-danger-subtle"
                      }`}
                    >
                      <i
                        className={`bi me-1 ${
                          user.active ? "bi-check-circle-fill" : "bi-x-circle-fill"
                        }`}
                      />
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {activeTab !== "ADMIN" && (
                    <td className="text-end pe-3">
                      <button
                        className={`btn btn-sm ${
                          user.active ? "btn-outline-danger" : "btn-outline-success"
                        }`}
                        onClick={() => setPendingToggle(user)}
                      >
                        <i
                          className={`bi me-1 ${
                            user.active ? "bi-person-x" : "bi-person-check"
                          }`}
                        />
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Staff Create Modal */}
      <StaffUserFormModal
        show={showCreateForm}
        submitting={creating}
        onSubmit={handleCreateStaff}
        onCancel={() => setShowCreateForm(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        show={!!pendingToggle}
        title={pendingToggle?.active ? "Deactivate Account" : "Activate Account"}
        message={`Are you sure you want to ${
          pendingToggle?.active ? "deactivate" : "activate"
        } ${pendingToggle?.firstName} ${pendingToggle?.lastName}'s account (${
          pendingToggle?.email
        })?`}
        confirmLabel={pendingToggle?.active ? "Deactivate" : "Activate"}
        confirmVariant={pendingToggle?.active ? "danger" : "success"}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </div>
  );
}
