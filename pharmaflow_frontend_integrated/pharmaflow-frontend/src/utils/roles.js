export const ROLES = {
  ADMIN: "ADMIN",
  PHARMACIST: "PHARMACIST",
  CUSTOMER: "CUSTOMER",
};

// Where each role lands right after login.
export function homePathForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin/dashboard";
    case ROLES.PHARMACIST:
      return "/pharmacist/dashboard";
    default:
      return "/";
  }
}
