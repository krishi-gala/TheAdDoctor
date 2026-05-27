import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import BrandDashboard from "../pages/BrandDashboard";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";
import { PERMISSIONS, BRAND_PERMISSIONS } from "../constants/permissions";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/brand-dashboard"
        element={
          <ProtectedRoute anyOf={BRAND_PERMISSIONS}>
            <BrandDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
