import api from "./api";
import medicineService from "./medicineService";

const GUEST_WISHLIST_KEY = "pharmaflow_guest_wishlist";

function getLocalGuestWishlist() {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGuestWishlist(list) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(list));
}

const wishlistService = {
  getWishlist: async () => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.get("/wishlist").then((res) => res.data);
    }
    return getLocalGuestWishlist();
  },

  addToWishlist: async (medicineId) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.post(`/wishlist/${medicineId}`).then((res) => res.data);
    }

    const list = getLocalGuestWishlist();
    if (!list.some((i) => String(i.medicineId) === String(medicineId))) {
      const medicine = await medicineService.getById(medicineId);
      list.push({
        wishlistItemId: Date.now() + Math.random(),
        medicineId: medicine.medicineId,
        medicineName: medicine.name,
        medicineImage: medicine.image,
        price: medicine.price,
        stock: medicine.stock,
      });
      saveLocalGuestWishlist(list);
    }
    return list;
  },

  removeFromWishlist: async (medicineId) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      return api.delete(`/wishlist/${medicineId}`);
    }

    const list = getLocalGuestWishlist().filter((i) => String(i.medicineId) !== String(medicineId));
    saveLocalGuestWishlist(list);
  },

  mergeGuestWishlist: async () => {
    const guestWishlist = getLocalGuestWishlist();
    if (guestWishlist.length === 0) return;

    for (const item of guestWishlist) {
      try {
        await api.post(`/wishlist/${item.medicineId}`);
      } catch {
        // ignore individual sync failure
      }
    }
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  },
};

export default wishlistService;
