import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function StaffUserFormModal({ show, onSubmit, onCancel, submitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (show) {
      reset({ firstName: "", lastName: "", email: "", password: "", phone: "", address: "", role: "PHARMACIST" });
    }
  }, [show, reset]);

  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h5 className="modal-title">Create Staff Account</h5>
                <button type="button" className="btn-close" onClick={onCancel} />
              </div>
              <div className="modal-body">
                <div className="alert alert-info py-2 small mb-3">
                  Only Admin and Pharmacist accounts can be created here. Customers self-register.
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Role</label>
                    <select className="form-select" {...register("role", { required: true })}>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                      {...register("firstName", { required: "First name is required", maxLength: { value: 50, message: "Max 50 characters" } })}
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                      {...register("lastName", { required: "Last name is required", maxLength: { value: 50, message: "Max 50 characters" } })}
                    />
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                        maxLength: { value: 100, message: "Max 100 characters" },
                      })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Temporary Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone (10 digits)</label>
                    <input
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      {...register("phone", { pattern: { value: /^[0-9]{10}$/, message: "Phone number must contain exactly 10 digits" } })}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      {...register("address", { maxLength: { value: 255, message: "Max 255 characters" } })}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
