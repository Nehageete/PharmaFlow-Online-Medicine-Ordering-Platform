import { useEffect } from "react";
import { useForm } from "react-hook-form";

const UNITS = ["STRIP", "BOTTLE", "TUBE", "PACKET"];

// Fields mirror MedicineRequest.java exactly: name, brand, manufacturer,
// description, price, stock, unit, expiryDate, image, prescriptionRequired, categoryId.
export default function MedicineFormModal({ show, medicine, categories, onSubmit, onCancel, submitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (show) {
      reset(
        medicine
          ? {
              name: medicine.name,
              brand: medicine.brand,
              manufacturer: medicine.manufacturer,
              description: medicine.description || "",
              price: medicine.price,
              stock: medicine.stock,
              unit: medicine.unit,
              expiryDate: medicine.expiryDate || "",
              image: medicine.image || "",
              prescriptionRequired: medicine.prescriptionRequired,
              categoryId: medicine.categoryId,
            }
          : {
              name: "",
              brand: "",
              manufacturer: "",
              description: "",
              price: "",
              stock: "",
              unit: "STRIP",
              expiryDate: "",
              image: "",
              prescriptionRequired: false,
              categoryId: categories?.[0]?.categoryId || "",
            }
      );
    }
  }, [show, medicine, categories, reset]);

  if (!show) return null;

  const submit = (data) => {
    onSubmit({
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      categoryId: parseInt(data.categoryId, 10),
      expiryDate: data.expiryDate || null,
    });
  };

  return (
    <>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleSubmit(submit)}>
              <div className="modal-header">
                <h5 className="modal-title">{medicine ? "Edit Medicine" : "Add Medicine"}</h5>
                <button type="button" className="btn-close" onClick={onCancel} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      {...register("name", { required: "Name is required", maxLength: 150 })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Brand</label>
                    <input
                      className={`form-control ${errors.brand ? "is-invalid" : ""}`}
                      {...register("brand", { required: "Brand is required", maxLength: 100 })}
                    />
                    {errors.brand && <div className="invalid-feedback">{errors.brand.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Manufacturer</label>
                    <input
                      className={`form-control ${errors.manufacturer ? "is-invalid" : ""}`}
                      {...register("manufacturer", { required: "Manufacturer is required", maxLength: 100 })}
                    />
                    {errors.manufacturer && <div className="invalid-feedback">{errors.manufacturer.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                      {...register("categoryId", { required: true })}
                    >
                      {categories?.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price (&#8377;)</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      {...register("price", { required: "Price is required", min: { value: 0.01, message: "Must be greater than 0" } })}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                      {...register("stock", { required: "Stock is required", min: { value: 0, message: "Cannot be negative" } })}
                    />
                    {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Unit</label>
                    <select className="form-select" {...register("unit", { required: true })}>
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-control" {...register("expiryDate")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Image URL</label>
                    <input className="form-control" {...register("image", { maxLength: 255 })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea rows="2" className="form-control" {...register("description")} />
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="prescriptionRequired"
                        {...register("prescriptionRequired")}
                      />
                      <label className="form-check-label" htmlFor="prescriptionRequired">
                        Requires prescription
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Medicine"}
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
