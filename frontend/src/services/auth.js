import API from "./api";

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getPermissions = () => {
  const raw = localStorage.getItem("permissions");

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setAuthSession = ({ accessToken, role, permissions = [] }) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("role", role);
  localStorage.setItem("permissions", JSON.stringify(permissions));
};

export const hasPermission = (permission) => {
  return getPermissions().includes(permission);
};

export const hasAnyPermission = (permissionList = []) => {
  const userPermissions = getPermissions();
  return permissionList.some((permission) =>
    userPermissions.includes(permission)
  );
};

export const getDefaultRoute = () => {
  const role = getRole();

  if (role === "brand") {
    return "/brand";
  }

  if (role === "admin" || role === "super_admin") {
    return "/admin/dashboard";
  }

  const permissions = getPermissions();

  if (permissions.includes("view_dashboard")) {
    return "/admin/dashboard";
  }

  if (permissions.includes("manage_brands")) {
    return "/admin/brands";
  }

  if (
    permissions.some((permission) =>
      ["purchase_package", "book_campaign", "view_campaigns"].includes(
        permission
      )
    )
  ) {
    return "/brand";
  }

  return "/unauthorized";
};

export const logout = (navigate) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("permissions");

  if (typeof navigate === "function") {
    navigate("/", { replace: true });
  } else {
    window.location.replace("/");
  }
};

export const changePassword = (current_password, new_password) => {
  return API.post("/change-password", {
    current_password,
    new_password,
  });
};

