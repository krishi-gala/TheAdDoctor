import { LogOut, LayoutDashboard, ShoppingBag, History } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";

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
    <>
      <style>{`
        .bsb-root {
          width: 260px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 3;
        }

        .bsb-logo-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 36px;
        }
        .bsb-logo-mark {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(14,165,233,0.4);
        }
        .bsb-logo-name { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.92); }
        .bsb-logo-sub  { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        .bsb-section-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          padding: 0 12px; margin-bottom: 8px; margin-top: 4px;
        }

        .bsb-menu { display: flex; flex-direction: column; gap: 2px; flex: 1; }

        .bsb-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 12px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500; width: 100%;
          transition: background 0.15s, color 0.15s;
          text-align: left; text-decoration: none;
        }
        .bsb-item:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
        }
        .bsb-item.active {
          background: rgba(14,165,233,0.18);
          border: 1px solid rgba(56,189,248,0.25);
          color: #7dd3fc;
        }
        .bsb-item.active .bsb-item-icon { color: #38bdf8; }
        .bsb-item-icon { flex-shrink: 0; }

        .bsb-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 16px 0;
        }

        .bsb-logout {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          cursor: pointer; color: #f87171;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          width: 100%; transition: background 0.15s;
        }
        .bsb-logout:hover { background: rgba(239,68,68,0.15); }
      `}</style>

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
    </>
  );
}
