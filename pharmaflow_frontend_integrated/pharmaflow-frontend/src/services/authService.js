import api from "./api";

// Maps 1:1 to AuthController.java
const authService = {
  // POST /auth/register | public | always creates a CUSTOMER (enforced server-side)
  register: (data) => api.post("/auth/register", data).then((res) => res.data),

  // POST /auth/login | public | same endpoint for all roles - role comes back in the response
  login: (data) => api.post("/auth/login", data).then((res) => res.data),
};

export default authService;
