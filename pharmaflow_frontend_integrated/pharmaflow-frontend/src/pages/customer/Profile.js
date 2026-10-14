import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import profileService from "../../services/profileService";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatDateOnly } from "../../utils/formatters";
import { notifyError, notifySuccess } from "../../utils/toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      notifySuccess("Profile updated successfully");
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setChangingPassword(true);
    try {
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      notifySuccess("Password changed successfully");
      resetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      notifyError(err.friendlyMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!profile) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <h4 className="mb-4">My Profile</h4>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between text-muted small">
              <span>Email</span>
              <span>{profile.email}</span>
            </div>
            <div className="d-flex justify-content-between text-muted small mt-1">
              <span>Role</span>
              <span>{profile.role}</span>
            </div>
            <div className="d-flex justify-content-between text-muted small mt-1">
              <span>Member since</span>
              <span>{formatDateOnly(profile.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                    {...register("firstName", { required: "First name is required", maxLength: 50 })}
                  />
                  {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                    {...register("lastName", { required: "Last name is required", maxLength: 50 })}
                  />
                  {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Phone (10 digits)</label>
                <input
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  {...register("phone", { pattern: { value: /^[0-9]{10}$/, message: "Phone number must contain exactly 10 digits" } })}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label">Address</label>
                <textarea
                  rows="2"
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  {...register("address", { maxLength: { value: 255, message: "Max 255 characters" } })}
                />
                {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h6 className="card-title mb-3">Change Password</h6>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
                  {...registerPassword("currentPassword", { required: "Current password is required" })}
                />
                {passwordErrors.currentPassword && (
                  <div className="invalid-feedback">{passwordErrors.currentPassword.message}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "New password must be at least 8 characters" },
                  })}
                />
                {passwordErrors.newPassword && (
                  <div className="invalid-feedback">{passwordErrors.newPassword.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === watchPassword("newPassword") || "Passwords don't match",
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <div className="invalid-feedback">{passwordErrors.confirmPassword.message}</div>
                )}
              </div>
              <button type="submit" className="btn btn-outline-primary" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
