import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title"><i className="ti ti-bolt"></i> Quick Actions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button className="quick-action-btn" onClick={() => navigate("/admin/campaigns")}>
          <i className="ti ti-check"></i> Approve Campaigns
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/inventory")}>
          <i className="ti ti-box"></i> Manage Inventory
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/packages")}>
          <i className="ti ti-package"></i> Manage Packages
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/formats")}>
          <i className="ti ti-apps"></i> Create Ad Format
        </button>
      </div>
    </div>
  );
}
