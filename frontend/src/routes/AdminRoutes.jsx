import { Navigate } from "react-router-dom";

export default function AdminAuth({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}