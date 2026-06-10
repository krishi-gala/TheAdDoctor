import { useEffect, useState } from "react";
import API from "../../services/api";
import StatsCards from "../../components/admin/Statscards";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";
import "./DashboardOverview.css";

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState({ total_brands: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canViewDashboard = hasPermission(PERMISSIONS.VIEW_DASHBOARD);

  const fetchDashboard = async () => {
    if (!canViewDashboard) return;
    setLoading(true);
    setError("");
    try {
      const [dashRes, pkgRes] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/packages", { params: { page_size: 1 } }),
      ]);
      setDashboardData({
        ...dashRes.data,
        total_packages: pkgRes.data?.total || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [canViewDashboard]);

  if (!canViewDashboard) {
    return (
      <p className="dash-no-permission">
        You do not have permission to view the dashboard overview.
      </p>
    );
  }

  return (
      <>
      <h1 className="dash-overview-title">Dashboard</h1>
      <p className="dash-overview-sub">
        Platform overview and key metrics
      </p>

      {error && <div className="dash-overview-error">{error}</div>}

      {loading ? (
        <div className="dash-skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-skeleton-card" />
          ))}
        </div>
      ) : (
        <StatsCards dashboardData={dashboardData} />
      )}
    </>
  );
}
