import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import BrandDashboard from "../pages/BrandDashboard";

import AdminAuth from "./AdminAuth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/admin-dashboard"
        element={
          <AdminAuth>
            <AdminDashboard />
          </AdminAuth>
        }
      />

      <Route
        path="/brand-dashboard"
        element={<BrandDashboard />}
      />
    </Routes>
  );
}