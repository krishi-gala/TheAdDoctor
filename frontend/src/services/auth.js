export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const logout = (navigate) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");

  if (typeof navigate === "function") {
    navigate("/", { replace: true });
  } else {
    window.location.replace("/");
  }
};