import api from "./api";

// Maps 1:1 to CategoryController.java
const categoryService = {
  // GET /categories | public
  getAll: () => api.get("/categories").then((res) => res.data),

  // GET /categories/{id} | public
  getById: (categoryId) =>
    api.get(`/categories/${categoryId}`).then((res) => res.data),

  // POST /categories | ADMIN only
  create: (data) => api.post("/categories", data).then((res) => res.data),

  // PUT /categories/{id} | ADMIN only
  update: (categoryId, data) =>
    api.put(`/categories/${categoryId}`, data).then((res) => res.data),

  // DELETE /categories/{id} | ADMIN only. Backend blocks this (400) if medicines still reference it.
  remove: (categoryId) => api.delete(`/categories/${categoryId}`),
};

export default categoryService;
