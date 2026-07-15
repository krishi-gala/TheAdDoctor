import { useNavigate } from "react-router-dom";
import NotificationBell from "../common/NotificationBell";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

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
          
          <NotificationBell />

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