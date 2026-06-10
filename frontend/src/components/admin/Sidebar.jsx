import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, hasPermission } from "../../services/auth";
import { ADMIN_MENU_ITEMS } from "../../config/adminMenu";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const visibleMenuItems = ADMIN_MENU_ITEMS.filter((item) =>
    hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout(navigate);
  };

  return (
      <aside className="sb-root">
        <div className="sb-logo-row">
          <div className="sb-logo-mark">Rx</div>
          <div>
            <div className="sb-logo-name">The Ad Doctor</div>
            <div className="sb-logo-sub">Admin Portal</div>
          </div>
        </div>

        <div className="sb-section-label">Navigation</div>

        <nav className="sb-menu">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `sb-item${isActive ? " active" : ""}`
                }
              >
                <Icon size={18} className="sb-item-icon" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sb-divider" />

        <button type="button" className="sb-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
  );
}