import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function CategoryFormModal({ show, category, onSubmit, onCancel, submitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (show) {
      reset(category ? { categoryName: category.categoryName, image: category.image || "" } : { categoryName: "", image: "" });
    }
  }, [show, category, reset]);

  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h5 className="modal-title">{category ? "Edit Category" : "Add Category"}</h5>
                <button type="button" className="btn-close" onClick={onCancel} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    className={`form-control ${errors.categoryName ? "is-invalid" : ""}`}
                    {...register("categoryName", { required: "Category name is required", maxLength: 100 })}
                  />
                  {errors.categoryName && <div className="invalid-feedback">{errors.categoryName.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Image URL</label>
                  <input className="form-control" {...register("image", { maxLength: 255 })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Category"}
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
