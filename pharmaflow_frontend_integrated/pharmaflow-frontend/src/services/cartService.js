import api from "./api";
import medicineService from "./medicineService";

const GUEST_CART_KEY = "pharmaflow_guest_cart";

function getLocalGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGuestCart(cart) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

const cartService = {
  getCart: async () => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.get("/cart").then((res) => res.data);
    }
    return getLocalGuestCart();
  },

  addToCart: async ({ medicineId, quantity = 1 }) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.post("/cart", { medicineId, quantity }).then((res) => res.data);
    }

    // Guest cart logic
    const cart = getLocalGuestCart();
    const existingIndex = cart.findIndex((i) => String(i.medicineId) === String(medicineId));

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].subtotal = Number(cart[existingIndex].price) * cart[existingIndex].quantity;
    } else {
      const medicine = await medicineService.getById(medicineId);
      cart.push({
        cartItemId: Date.now() + Math.random(),
        medicineId: medicine.medicineId,
        medicineName: medicine.name,
        medicineImage: medicine.image,
        price: medicine.price,
        quantity,
        subtotal: Number(medicine.price) * quantity,
        prescriptionRequired: medicine.prescriptionRequired,
        stock: medicine.stock,
      });
    }

    saveLocalGuestCart(cart);
    return cart;
  },

  updateQuantity: async (cartItemId, quantity) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.put(`/cart/${cartItemId}`, { quantity }).then((res) => res.data);
    }

    const cart = getLocalGuestCart();
    const item = cart.find((i) => String(i.cartItemId) === String(cartItemId));
    if (item) {
      item.quantity = quantity;
      item.subtotal = Number(item.price) * quantity;
      saveLocalGuestCart(cart);
      return item;
    }
    throw new Error("Item not found");
  },

  removeFromCart: async (cartItemId) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.delete(`/cart/${cartItemId}`);
    }

    const cart = getLocalGuestCart().filter((i) => String(i.cartItemId) !== String(cartItemId));
    saveLocalGuestCart(cart);
  },

  mergeGuestCart: async () => {
    const guestCart = getLocalGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      try {
        await api.post("/cart", { medicineId: item.medicineId, quantity: item.quantity });
      } catch {
        // ignore individual item sync failures
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
  },
};

export default cartService;
