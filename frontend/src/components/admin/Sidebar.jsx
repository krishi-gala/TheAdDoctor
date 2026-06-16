import { useState, useEffect } from "react";
import { LogOut, ChevronLeft } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, hasPermission } from "../../services/auth";
import { ADMIN_MENU_ITEMS } from "../../config/adminMenu";
import { fetchPendingBookingsCount } from "../../services/campaignBookings";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // Keep a CSS custom property in sync so fixed overlays can align to the content area
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '68px' : '260px'
    );
  }, [collapsed]);

  const visibleMenuItems = ADMIN_MENU_ITEMS.filter((item) =>
    hasPermission(item.permission)
  );

  const loadPendingCount = async () => {
    try {
      const res = await fetchPendingBookingsCount();
      setPendingCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to load pending campaign count in sidebar", err);
    }
  };

  const canApproveCampaigns = visibleMenuItems.some(item => item.id === "campaigns");

  useEffect(() => {
    if (canApproveCampaigns) {
      loadPendingCount();
      const handleUpdateCount = () => { loadPendingCount(); };
      window.addEventListener("refreshPendingCount", handleUpdateCount);
      return () => { window.removeEventListener("refreshPendingCount", handleUpdateCount); };
    }
  }, [canApproveCampaigns]);

  const handleLogout = () => { logout(navigate); };

  return (
    <aside className={`sb-root${collapsed ? " sb-collapsed" : ""}`}>

      {/* Toggle arrow button */}
      <button
        className="sb-toggle"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft size={16} className="sb-toggle-icon" />
      </button>

      <div className="sb-logo-row">
        <div className="sb-logo-mark">Rx</div>
        <div className="sb-logo-text">
          <div className="sb-logo-name">The Ad Doctor</div>
          <div className="sb-logo-sub">Admin Portal</div>
        </div>
      </div>

      <div className="sb-section-label">Navigation</div>

      <nav className="sb-menu">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isCampaigns = item.id === "campaigns";
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sb-item${isActive ? " active" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="sb-item-icon" />
              <span className="sb-item-label">{item.label}</span>
              {isCampaigns && pendingCount > 0 && (
                <span className="sb-pending-badge">{pendingCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sb-divider" />

      <button type="button" className="sb-logout" onClick={handleLogout} title={collapsed ? "Logout" : undefined}>
        <LogOut size={18} />
        <span className="sb-item-label">Logout</span>
      </button>
    </aside>
  );
}