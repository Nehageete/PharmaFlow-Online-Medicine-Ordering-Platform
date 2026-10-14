import api from "./api";

// Dynamically load Razorpay Checkout SDK script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const paymentService = {
  // POST /payments/process | body: { orderId, paymentMethod, transactionId }
  processPayment: (data) => api.post("/payments/process", data).then((res) => res.data),

  // POST /payments/create-razorpay-order/{orderId}
  createRazorpayOrder: (orderId) =>
    api.post(`/payments/create-razorpay-order/${orderId}`).then((res) => res.data),

  // POST /payments/verify-razorpay-payment | body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
  verifyRazorpayPayment: (data) =>
    api.post("/payments/verify-razorpay-payment", data).then((res) => res.data),

  // Launch interactive Razorpay modal
  displayRazorpayModal: async ({ orderId, userDetails, onSuccess, onError }) => {
    const res = await loadRazorpayScript();
    if (!res) {
      if (onError) onError("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const rzpOrder = await paymentService.createRazorpayOrder(orderId);

      const options = {
        key: rzpOrder.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_TMAWYFG6JUtyio",
        amount: rzpOrder.amountInPaise,
        currency: rzpOrder.currency || "INR",
        name: "PharmaFlow Pharmacy",
        description: `Payment for Order #${orderId}`,
        image: "/images/medicine-placeholder.jpg",
        handler: async (response) => {
          try {
            const verifyRes = await paymentService.verifyRazorpayPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id || rzpOrder.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || "simulated_sig",
            });
            if (onSuccess) onSuccess(verifyRes);
          } catch (err) {
            if (onError) onError(err.friendlyMessage || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            if (onError) onError("Payment cancelled or closed.");
          },
        },
        prefill: {
          name: userDetails?.name || "Customer",
          email: userDetails?.email || "customer@pharmaflow.local",
          contact: userDetails?.phone || "9999999999",
        },
        theme: {
          color: "#026433",
        },
      };

      // Only pass order_id if it was created on real Razorpay servers (not simulated 'order_rzp_...')
      if (rzpOrder.razorpayOrderId && !rzpOrder.razorpayOrderId.startsWith("order_rzp_")) {
        options.order_id = rzpOrder.razorpayOrderId;
      }

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        if (onError) onError(response?.error?.description || "Payment failed at Razorpay gateway");
      });
      paymentObject.open();
    } catch (err) {
      if (onError) onError(err.friendlyMessage || "Could not initiate Razorpay checkout");
    }
  },

  // GET /admin/payments | ADMIN only
  getAllPayments: () => api.get("/admin/payments").then((res) => res.data),
};

export default paymentService;
