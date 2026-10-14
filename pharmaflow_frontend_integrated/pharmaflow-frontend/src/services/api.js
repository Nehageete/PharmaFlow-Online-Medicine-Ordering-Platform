import axios from "axios";

// Single source of truth for the backend base URL.
// Matches Spring Boot's default port (8080) and has no context-path (see application.properties).
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT (if present) to every outgoing request.
// The backend's JwtFilter reads "Authorization: Bearer <token>" and puts
// the decoded user_id / user_role onto the SecurityContext (see JwtFilter.java).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pharmaflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses. The backend's GlobalExceptionHandler always
// returns one of two shapes:
//   1) ApiResponse { message, status, timeStamp }               -> most exceptions
//   2) Map<String,String> of fieldName -> message                -> @Valid failures
// This interceptor flattens both into a single `error.friendlyMessage` string
// and, for validation errors, keeps the raw field map on `error.fieldErrors`.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;

    if (!res) {
      error.friendlyMessage =
        "Could not reach the server. Please check your connection and try again.";
      return Promise.reject(error);
    }

    // Expired/invalid JWT -> JwtFilter itself returns 401 with this exact shape,
    // and GlobalExceptionHandler's AuthenticationException handler does too.
    if (res.status === 401) {
      localStorage.removeItem("pharmaflow_token");
      localStorage.removeItem("pharmaflow_user");
      error.friendlyMessage =
        res.data?.message || "Your session has expired. Please log in again.";
      // Let the app redirect on its own terms; components/context decide what to do.
      return Promise.reject(error);
    }

    if (res.data && typeof res.data === "object") {
      if (res.data.message) {
        // ApiResponse shape
        error.friendlyMessage = res.data.message;
      } else {
        // Bean validation shape: { fieldName: "message", ... }
        const messages = Object.values(res.data);
        if (messages.length > 0) {
          error.fieldErrors = res.data;
          error.friendlyMessage = messages[0];
        }
      }
    }

    if (!error.friendlyMessage) {
      error.friendlyMessage = "Something went wrong. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
