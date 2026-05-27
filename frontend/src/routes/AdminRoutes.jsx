import ProtectedRoute from "../components/ProtectedRoute";
import { PERMISSIONS } from "../constants/permissions";

export default function AdminAuth({ children }) {
  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
      {children}
    </ProtectedRoute>
  );
}
