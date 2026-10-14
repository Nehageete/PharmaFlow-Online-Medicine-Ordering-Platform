import api from "./api";
import orderService from "./orderService";

// Maps 1:1 to AdminUserController.java, plus derived (not invented) order/payment views.
const adminService = {
  // GET /admin/users
  getAllUsers: () => api.get("/admin/users").then((res) => res.data),

  // GET /admin/users/role/{role} | role: ADMIN | PHARMACIST | CUSTOMER
  getUsersByRole: (role) =>
    api.get(`/admin/users/role/${role}`).then((res) => res.data),

  // PATCH /admin/users/{userId}/status?active=true|false
  setUserActiveStatus: (userId, active) =>
    api
      .patch(`/admin/users/${userId}/status`, null, { params: { active } })
      .then((res) => res.data),

  // POST /admin/users | body: { firstName, lastName, email, password, phone, address, role }
  // Backend rejects role=CUSTOMER here (409/400) - customers must self-register via /auth/register.
  createStaffUser: (data) => api.post("/admin/users", data).then((res) => res.data),

  // No standalone "list all orders" endpoint exists on the backend - this
  // aggregates GET /orders/status/{status} for every status (see orderService).
  getAllOrders: () => orderService.getAllOrdersAggregated(),

  // GET /admin/payments | ADMIN only - AdminPaymentController.getAllPayments().
  // Returns AdminPaymentResponse[]: { paymentId, amount, paymentMethod, paymentStatus,
  // transactionId, paymentDate, gatewayName, orderId, customerName, customerEmail }.
  getPayments: () => api.get("/admin/payments").then((res) => res.data),

  // GET /admin/reports/summary | ADMIN only - AdminReportsController.getSummary().
  // Returns ReportsSummaryResponse: { totalRevenue, ordersByStatus: {status: count},
  // lowStockMedicines: MedicineResponse[], topSellingMedicines: [{medicineId, medicineName, totalQuantitySold}] }.
  getReportsSummary: () => api.get("/admin/reports/summary").then((res) => res.data),
};

export default adminService;
