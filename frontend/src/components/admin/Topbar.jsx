import { Bell, Search } from "lucide-react";
import "./Topbar.css";

export default function Topbar() {
  return (
      <div className="tb-root">
          <div className="tb-left">
            <div className="tb-greeting">
              <span className="tb-greeting-dot" />
              Live Dashboard
            </div>
            <div className="tb-title">Dashboard</div>
            <div className="tb-sub">Welcome back, Admin — here's what's happening today.</div>
          </div>

        <div className="tb-right">
          <div className="tb-search">
            <Search size={14} />
            <input placeholder="Search campaigns, brands…" />
          </div>

          <div className="tb-bell">
            <Bell size={16} />
            <span className="tb-bell-dot" />
          </div>

          <div className="tb-avatar">
            <div className="tb-avatar-circle">Ad</div>
            <div>
              <div className="tb-avatar-name">Admin</div>
              <div className="tb-avatar-role">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
  );
}