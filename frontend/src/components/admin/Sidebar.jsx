import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Package,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Building2,       label: "Brands"    },
  { icon: Megaphone,       label: "Campaigns" },
  { icon: Package,         label: "Ad Packages"},
  { icon: BarChart3,       label: "Analytics" },
  { icon: Settings,        label: "Settings"  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <>
      <style>{`
        .sb-root {
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

        .sb-logo-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 36px;
        }
        .sb-logo-mark {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(124,58,237,0.4);
        }
        .sb-logo-name { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.92); }
        .sb-logo-sub  { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        .sb-section-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          padding: 0 12px; margin-bottom: 8px; margin-top: 4px;
        }

        .sb-menu { display: flex; flex-direction: column; gap: 2px; flex: 1; }

        .sb-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 12px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500; width: 100%;
          transition: background 0.15s, color 0.15s;
          text-align: left;
        }
        .sb-item:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
        }
        .sb-item.active {
          background: rgba(124,58,237,0.22);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd;
        }
        .sb-item.active .sb-item-icon {
          color: #a78bfa;
        }
        .sb-item-icon { flex-shrink: 0; }

        .sb-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 16px 0;
        }

        .sb-logout {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          cursor: pointer; color: #f87171;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          width: 100%; transition: background 0.15s;
        }
        .sb-logout:hover { background: rgba(239,68,68,0.15); }
      `}</style>

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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                className={`sb-item${isActive ? " active" : ""}`}
                onClick={() => setActive(item.label)}
              >
                <Icon size={18} className="sb-item-icon" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sb-divider" />

        <button type="button" className="sb-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}