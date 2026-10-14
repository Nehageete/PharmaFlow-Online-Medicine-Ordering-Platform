import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = data;
      const sessionUser = await registerUser(payload);
      notifySuccess(`Welcome to PharmaFlow, ${sessionUser.firstName}!`);
      navigate("/", { replace: true });
    } catch (err) {
      notifyError(err.friendlyMessage);
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
        <div className="auth-card-modern shadow-lg" style={{ maxWidth: "540px" }}>
          {/* Top Avatar Circle */}
          <div className="auth-avatar-circle">
            <i className="bi bi-person-plus" />
          </div>

          <h2 className="auth-title">
            CUSTOMER REGISTER
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="auth-input-group mb-3">
                  <i className="bi bi-person auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input-underline"
                    placeholder="First Name"
                    {...register("firstName", { required: "First name is required", maxLength: { value: 50, message: "Max 50 characters" } })}
                  />
                  {errors.firstName && <div className="auth-error-msg">{errors.firstName.message}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="auth-input-group mb-3">
                  <i className="bi bi-person auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input-underline"
                    placeholder="Last Name"
                    {...register("lastName", { required: "Last name is required", maxLength: { value: 50, message: "Max 50 characters" } })}
                  />
                  {errors.lastName && <div className="auth-error-msg">{errors.lastName.message}</div>}
                </div>
              </div>
            </div>

            <div className="auth-input-group mb-3">
              <i className="bi bi-envelope auth-input-icon" />
              <input
                type="email"
                className="auth-input-underline"
                placeholder="Email ID"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
              />
              {errors.email && <div className="auth-error-msg">{errors.email.message}</div>}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="auth-input-group mb-3">
                  <i className="bi bi-lock auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input-underline"
                    placeholder="Password (8+ chars)"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Min 8 characters" },
                    })}
                  />
                  {errors.password && <div className="auth-error-msg">{errors.password.message}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="auth-input-group mb-3">
                  <i className="bi bi-shield-lock auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input-underline"
                    placeholder="Confirm Password"
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && <div className="auth-error-msg">{errors.confirmPassword.message}</div>}
                </div>
              </div>
            </div>

            <div className="auth-input-group mb-3">
              <i className="bi bi-telephone auth-input-icon" />
              <input
                type="tel"
                className="auth-input-underline"
                placeholder="Phone (10 digits)"
                {...register("phone", {
                  pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" },
                })}
              />
              {errors.phone && <div className="auth-error-msg">{errors.phone.message}</div>}
            </div>

            <div className="auth-input-group mb-4">
              <i className="bi bi-geo-alt auth-input-icon" />
              <input
                type="text"
                className="auth-input-underline"
                placeholder="Shipping Address (Optional)"
                {...register("address", { maxLength: { value: 255, message: "Max 255 characters" } })}
              />
              {errors.address && <div className="auth-error-msg">{errors.address.message}</div>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  CREATING ACCOUNT...
                </span>
              ) : (
                "REGISTER"
              )}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
