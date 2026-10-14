import medicineService from "./medicineService";
import orderService from "./orderService";

// The backend has no separate "/pharmacist/*" controller (SecurityConfig just
// reserves that URL prefix for future use). Every action a pharmacist takes
// today goes through OrderController/MedicineController with role-based
// authorization enforced by SecurityConfig - this module just gives those
// same calls pharmacist-friendly names.
const pharmacistService = {
  // GET /orders/status/PLACED - orders awaiting prescription approval/rejection
  getPendingPrescriptions: () => orderService.getOrdersByStatus("PLACED"),

  // GET /orders/status/{status} - full queue for any status (Dashboard use)
  getOrdersByStatus: (status) => orderService.getOrdersByStatus(status),

  // PATCH /orders/{orderId}/status with CONFIRMED (approve) or CANCELLED (reject)
  reviewPrescription: (orderId, approve) =>
    orderService.updateOrderStatus(orderId, approve ? "CONFIRMED" : "CANCELLED"),

  // PATCH /orders/{orderId}/status - move a confirmed order through fulfillment
  updateOrderStatus: (orderId, status) =>
    orderService.updateOrderStatus(orderId, status),

  // PATCH /medicines/{id}/stock
  updateStock: (medicineId, stock) => medicineService.updateStock(medicineId, stock),
};

export default pharmacistService;
