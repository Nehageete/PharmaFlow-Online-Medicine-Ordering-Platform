import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { homePathForRole } from "../../utils/roles";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("CUSTOMER");
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === "ADMIN") {
      setValue("email", "admin@pharmaflow.local");
      setValue("password", "ChangeMe123!");
    } else if (role === "PHARMACIST") {
      setValue("email", "pharmacist@pharmaflow.local");
      setValue("password", "ChangeMe123!");
    } else {
      setValue("email", "");
      setValue("password", "");
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const sessionUser = await login(data);
      notifySuccess(`Welcome back, ${sessionUser.firstName}!`);
      const redirectTo = location.state?.from?.pathname || homePathForRole(sessionUser.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      notifyError(err.friendlyMessage || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="auth-page-container"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(2, 60, 32, 0.72) 0%, rgba(90, 135, 128, 0.78) 100%), url(/images/pharmacy-bg.jpg)",
      }}
    >
      {/* Brand Nav Header */}
      <div className="auth-brand-nav">
        <Link to="/" className="auth-brand-link">
          <i className="bi bi-capsule-pill fs-4" />
          <span>PharmaFlow</span>
        </Link>
      </div>

      <div className="auth-wrapper">
        <div className="auth-card-modern shadow-lg">
          {/* Top Avatar Circle */}
          <div className="auth-avatar-circle">
            <i className="bi bi-person" />
          </div>

          {/* Dynamic Title */}
          <h2 className="auth-title">
            {selectedRole} LOGIN
          </h2>

          {/* Role Switcher Tabs */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${selectedRole === "CUSTOMER" ? "active" : ""}`}
              onClick={() => handleRoleSelect("CUSTOMER")}
            >
              Customer
            </button>
            <button
              type="button"
              className={`auth-role-tab ${selectedRole === "ADMIN" ? "active" : ""}`}
              onClick={() => handleRoleSelect("ADMIN")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`auth-role-tab ${selectedRole === "PHARMACIST" ? "active" : ""}`}
              onClick={() => handleRoleSelect("PHARMACIST")}
            >
              Pharmacist
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email ID Field */}
            <div className="auth-input-group">
              <i className="bi bi-envelope auth-input-icon" />
              <input
                type="email"
                className="auth-input-underline"
                placeholder="Email ID"
                autoComplete="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && <div className="auth-error-msg">{errors.email.message}</div>}
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input-underline"
                placeholder="Password"
                autoComplete="current-password"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
              {errors.password && <div className="auth-error-msg">{errors.password.message}</div>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <label className="auth-checkbox-label d-flex align-items-center gap-2 mb-0">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <span
                className="auth-forgot-link"
                style={{ cursor: "pointer" }}
                onClick={() => notifySuccess("Please contact support or administrator to reset password.")}
              >
                Forgot Password?
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  LOGGING IN...
                </span>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="auth-footer-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
