import api from "./api";

// Maps 1:1 to ReviewController.java
const reviewService = {
  // GET /reviews/medicine/{medicineId} | public
  getForMedicine: (medicineId) =>
    api.get(`/reviews/medicine/${medicineId}`).then((res) => res.data),

  // POST /reviews | CUSTOMER only | body: { medicineId, rating, comment }
  // Backend rejects (409) a second review by the same user for the same medicine.
  addReview: (data) => api.post("/reviews", data).then((res) => res.data),
};

export default reviewService;
