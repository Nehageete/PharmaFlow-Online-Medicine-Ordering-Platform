import api from "./api";

// All six OrderStatus values from OrderStatus.java, in their real lifecycle order.
export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

// Maps 1:1 to OrderController.java
const orderService = {
  // POST /orders | multipart/form-data | CUSTOMER only
  // The backend expects exactly two parts:
  //   "request"          -> JSON blob: { shippingAddress, paymentMethod }
  //   "prescriptionFile" -> optional file part (only required if the service
  //                          decides the cart contains a prescription-required medicine;
  //                          if it's required and missing, the backend returns 400)
  placeOrder: ({ shippingAddress, paymentMethod, prescriptionFile }) => {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob([JSON.stringify({ shippingAddress, paymentMethod })], {
        type: "application/json",
      })
    );
    if (prescriptionFile) {
      formData.append("prescriptionFile", prescriptionFile);
    }
    return api
      .post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  // GET /orders/my | any logged-in user, scoped to their own orders
  getMyOrders: () => api.get("/orders/my").then((res) => res.data),

  // GET /orders/{orderId} | owner-only (enforced server-side)
  trackOrder: (orderId) =>
    api.get(`/orders/${orderId}`).then((res) => res.data),

  // GET /orders/status/{status} | PHARMACIST or ADMIN only
  getOrdersByStatus: (status) =>
    api.get(`/orders/status/${status}`).then((res) => res.data),

  // PATCH /orders/{orderId}/status | PHARMACIST only | body: { status }
  updateOrderStatus: (orderId, status) =>
    api
      .patch(`/orders/${orderId}/status`, { status })
      .then((res) => res.data),

  // GET /orders/{orderId}/prescription | owner, or PHARMACIST/ADMIN for any order.
  // Streams the raw file (image or PDF) - not JSON - so it must be requested as a blob.
  // A plain <a href> can't work here since the endpoint requires the JWT Authorization
  // header (attached automatically by the api instance's request interceptor).
  // Returns { blobUrl, contentType } - caller is responsible for revoking the blobUrl
  // (URL.revokeObjectURL) once it's no longer displayed, to avoid leaking memory.
  getPrescriptionFile: (orderId) =>
    api.get(`/orders/${orderId}/prescription`, { responseType: "blob" }).then((res) => ({
      blobUrl: URL.createObjectURL(res.data),
      contentType: res.headers["content-type"],
    })),

  // NOTE: There is no backend endpoint that returns ALL orders across every
  // status, and no dedicated Payments endpoint. This helper aggregates orders
  // by calling GET /orders/status/{status} once per OrderStatus value and
  // combining the results client-side. Payment info is already embedded in
  // each OrderResponse.payment, so the Admin Payments screen derives from
  // this same aggregate rather than a separate (non-existent) API.
  getAllOrdersAggregated: async () => {
    const results = await Promise.all(
      ORDER_STATUSES.map((status) =>
        api
          .get(`/orders/status/${status}`)
          .then((res) => res.data)
          .catch(() => [])
      )
    );
    return results.flat();
  },
};

export default orderService;
