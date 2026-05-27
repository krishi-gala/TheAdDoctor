import { Navigate } from "react-router-dom";

/** @deprecated Use /admin/dashboard — kept for backward compatibility */
export default function AdminDashboard() {
  return <Navigate to="/admin/dashboard" replace />;
}
