import api from "./api";

// Maps 1:1 to ProfileController.java. Works for any logged-in role.
const profileService = {
  // GET /profile
  getProfile: () => api.get("/profile").then((res) => res.data),

  // PUT /profile | body: { firstName, lastName, phone, address } (NOT email/password)
  updateProfile: (data) => api.put("/profile", data).then((res) => res.data),

  // PUT /profile/password | body: { currentPassword, newPassword } | any logged-in role
  // Backend re-verifies currentPassword server-side before updating (see ChangePasswordRequest.java).
  changePassword: (data) => api.put("/profile/password", data).then((res) => res.data),
};

export default profileService;
