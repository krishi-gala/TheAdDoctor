import { useEffect, useState } from "react";
import API from "../../services/api";
import StatsCards from "../../components/admin/Statscards";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";

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
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        You do not have permission to view the dashboard overview.
      </p>
    );
  }

  return (
    <>
      <style>{`
        .dash-overview-title {
          font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .dash-overview-sub {
          font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 28px;
        }
        .dash-overview-error {
          padding: 14px 18px; border-radius: 12px; margin-bottom: 20px;
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; font-size: 14px;
        }
        .dash-skeleton-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .dash-skeleton-card {
          height: 120px; border-radius: 20px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 200% 100%;
          animation: dash-shimmer 1.2s infinite;
        }
        @keyframes dash-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

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
