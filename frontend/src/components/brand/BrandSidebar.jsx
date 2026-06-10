import { LogOut, LayoutDashboard, ShoppingBag, History } from "lucide-react";
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
    permission: null, // Always show to brands
  },
  {
    id: "buy-package",
    label: "Buy Package",
    path: "/brand/buy-package",
    icon: ShoppingBag,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
  {
    id: "transactions",
    label: "Purchase History",
    path: "/brand/transactions",
    icon: History,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
  {
    id: "ad-formats",
    label: "Ad Formats",
    path: "/brand/ad-formats",
    icon: ShoppingBag,
    permission: PERMISSIONS.PURCHASE_PACKAGE,
  },
];

export default function BrandSidebar() {
  const navigate = useNavigate();

  const visibleMenuItems = BRAND_MENU_ITEMS.filter((item) =>
    !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <aside className="bsb-root">
      <div className="bsb-logo-row">
        <div className="bsb-logo-mark">Dr</div>
        <div>
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
            >
              <Icon size={18} className="bsb-item-icon" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="bsb-divider" />

      <button type="button" className="bsb-logout" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
