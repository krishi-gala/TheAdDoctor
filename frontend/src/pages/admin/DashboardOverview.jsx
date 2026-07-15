import { useEffect, useState } from "react";
import API from "../../services/api";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";
import "./DashboardOverview.css";

import ExecutiveSummary from "../../components/admin/dashboard/ExecutiveSummary";
import ActionCenter from "../../components/admin/dashboard/ActionCenter";
import LiveOperations from "../../components/admin/dashboard/LiveOperations";
import InventoryHealth from "../../components/admin/dashboard/InventoryHealth";
import CampaignOverview from "../../components/admin/dashboard/CampaignOverview";

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canViewDashboard = hasPermission(PERMISSIONS.VIEW_DASHBOARD);

  const fetchDashboard = async () => {
    if (!canViewDashboard) return;
    setLoading(true);
    setError("");
    try {
      const dashRes = await API.get("/admin/dashboard");
      setDashboardData(dashRes.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load operations dashboard"
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
      <div className="dash-page">
        <p style={{ color: "#ef4444" }}>You do not have permission to view the operations dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {error && <div className="dash-error-banner">{error}</div>}

      {loading ? (
        <div className="dash-loading">
          <div className="dash-skeleton-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="dash-skeleton-card" />)}
          </div>
        </div>
      ) : dashboardData && (
        <div className="dash-layout-grid">
          {/* Row 1: Executive Summary */}
          <div className="dash-row-executive">
            <ExecutiveSummary data={dashboardData.executive_summary} />
          </div>

          {/* Row 2: Live Operations & Pending Approvals (Action Center) */}
          <div className="dash-row-split">
            <LiveOperations data={dashboardData.live_operations} />
            <ActionCenter data={dashboardData.action_center} />
          </div>

          {/* Row 3: Inventory Health & Campaign Overview */}
          <div className="dash-row-split">
            <InventoryHealth data={dashboardData.inventory_health} />
            <CampaignOverview data={dashboardData.campaign_overview} />
          </div>
        </div>
      )}
    </div>
  );
}
