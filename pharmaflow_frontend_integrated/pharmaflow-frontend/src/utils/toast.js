import { toast } from "react-toastify";

// Thin wrapper so every page raises toasts the same way and we can tune
// defaults (position, autoClose) in exactly one place.
const toastOptions = { position: "top-right", autoClose: 3000 };

export const notifySuccess = (message) => toast.success(message, toastOptions);
export const notifyError = (message) => toast.error(message, toastOptions);
export const notifyInfo = (message) => toast.info(message, toastOptions);
