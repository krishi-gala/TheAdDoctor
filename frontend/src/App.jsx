import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import BrandDashboard from "./pages/BrandDashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import BrandLayout from "./layouts/BrandLayout";
import DashboardOverview from "./pages/admin/DashboardOverview";
import BrandsPage from "./pages/admin/BrandsPage";
import PackagesPage from "./pages/admin/PackagesPage";
import BuyPackage from "./pages/brand/BuyPackage";
import TransactionHistory from "./components/brand/TransactionHistory";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import AdminAdFormats from "./pages/admin/AdminAdFormats";
import InventoryDashboard from "./pages/admin/InventoryDashboard";
import Reports from "./pages/admin/Reports";
import BrandFormats from "./pages/brand/BrandFormats";
import { PERMISSIONS, BRAND_PERMISSIONS } from "./constants/permissions";

const ADMIN_ACCESS_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.MANAGE_BRANDS,
  PERMISSIONS.MANAGE_PACKAGES,
  PERMISSIONS.MANAGE_BOOKINGS,
  PERMISSIONS.APPROVE_CAMPAIGNS,
  PERMISSIONS.VIEW_REPORTS,
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute anyOf={ADMIN_ACCESS_PERMISSIONS}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
                <DashboardOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="brands"
            element={
              <ProtectedRoute permission={PERMISSIONS.MANAGE_BRANDS}>
                <BrandsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="packages"
            element={
              <ProtectedRoute permission={PERMISSIONS.MANAGE_PACKAGES}>
                <PackagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute permission={PERMISSIONS.MANAGE_BOOKINGS}>
                <AdminPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route
            path="ad-formats"
            element={
              <ProtectedRoute permission={PERMISSIONS.MANAGE_BOOKINGS}>
                <AdminAdFormats />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute permission={PERMISSIONS.MANAGE_BOOKINGS}>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="campaigns"
            element={
              <ProtectedRoute permission={PERMISSIONS.APPROVE_CAMPAIGNS}>
                <AdminPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute permission={PERMISSIONS.VIEW_REPORTS}>
                <Reports />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/brand"
          element={
            <ProtectedRoute anyOf={BRAND_PERMISSIONS}>
              <BrandLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BrandDashboard />} />
          <Route
            path="buy-package"
            element={
              <ProtectedRoute permission={PERMISSIONS.PURCHASE_PACKAGE}>
                <BuyPackage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ad-formats"
            element={
              <ProtectedRoute permission={PERMISSIONS.PURCHASE_PACKAGE}>
                <BrandFormats />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <ProtectedRoute permission={PERMISSIONS.PURCHASE_PACKAGE}>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
