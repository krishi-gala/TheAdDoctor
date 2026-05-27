import { Navigate } from "react-router-dom";
import {
  getToken,
  hasPermission,
  hasAnyPermission,
} from "../services/auth";

export default function ProtectedRoute({
  children,
  permission,
  anyOf = [],
}) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (anyOf.length > 0 && !hasAnyPermission(anyOf)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
