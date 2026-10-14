import api from "./api";

// Maps 1:1 to MedicineController.java
const medicineService = {
  // GET /medicines | public
  getAll: () => api.get("/medicines").then((res) => res.data),

  // GET /medicines/{id} | public
  getById: (medicineId) =>
    api.get(`/medicines/${medicineId}`).then((res) => res.data),

  // GET /medicines/category/{categoryId} | public
  getByCategory: (categoryId) =>
    api.get(`/medicines/category/${categoryId}`).then((res) => res.data),

  // GET /medicines/search?name=... | public
  search: (name) =>
    api.get("/medicines/search", { params: { name } }).then((res) => res.data),

  // POST /medicines | ADMIN only
  create: (data) => api.post("/medicines", data).then((res) => res.data),

  // PUT /medicines/{id} | ADMIN only
  update: (medicineId, data) =>
    api.put(`/medicines/${medicineId}`, data).then((res) => res.data),

  // DELETE /medicines/{id} | ADMIN only
  remove: (medicineId) => api.delete(`/medicines/${medicineId}`),

  // PATCH /medicines/{id}/stock | PHARMACIST only. Body: { stock: number }
  updateStock: (medicineId, stock) =>
    api
      .patch(`/medicines/${medicineId}/stock`, { stock })
      .then((res) => res.data),
};

export default medicineService;
