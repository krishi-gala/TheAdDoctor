import { useState } from "react";
import { LogOut, ChevronLeft, LayoutDashboard, ShoppingBag, History, Megaphone } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";
import "./BrandSidebar.css";

const BRAND_MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/brand/dashboard",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    id: "buy-package",
    label: "Buy Package",
    path: "/brand/buy-package",
    icon: ShoppingBag,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
  {
    id: "ad-formats",
    label: "Ad Formats",
    path: "/brand/ad-formats",
    icon: Megaphone,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
  {
    id: "transactions",
    label: "Purchase History",
    path: "/brand/transactions",
    icon: History,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
];

export default function BrandSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const visibleMenuItems = BRAND_MENU_ITEMS.filter((item) =>
    !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <aside className={`bsb-root${collapsed ? " bsb-collapsed" : ""}`}>

      {/* Toggle arrow */}
      <button
        className="bsb-toggle"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft size={16} className="bsb-toggle-icon" />
      </button>

      <div className="bsb-logo-row">
        <div className="bsb-logo-mark">Dr</div>
        <div className="bsb-logo-text">
          <div className="bsb-logo-name">The Ad Doctor</div>
          <div className="bsb-logo-sub">Brand Portal</div>
        </div>
      </div>

      <div className="bsb-section-label">Menu</div>

      <nav className="bsb-menu">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `bsb-item${isActive ? " active" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="bsb-item-icon" />
              <span className="bsb-item-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="bsb-divider" />

      <button
        type="button"
        className="bsb-logout"
        onClick={handleLogout}
        title={collapsed ? "Logout" : undefined}
      >
        <LogOut size={18} />
        <span className="bsb-item-label">Logout</span>
      </button>
    </aside>
  );
}
