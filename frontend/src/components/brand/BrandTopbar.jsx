import { Bell } from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import { getRole } from "../../services/auth";
import "./BrandTopbar.css";

export default function BrandTopbar({ pageTitle = "Dashboard", walletState }) {
  const roleName = getRole() === "brand" ? "Brand Partner" : "Client";

  return (
      <div className="btb-root">
          <div className="btb-left">
            <div className="btb-greeting">
              <span className="btb-greeting-dot" />
              Ad Workspace
            </div>
            <div className="btb-title">{pageTitle}</div>
            <div className="btb-sub">Manage your advertising campaigns and credits.</div>
          </div>

        <div className="btb-right">
          {walletState && walletState.remaining_credits !== undefined && (
            <div className="btb-credits-badge">
              <span className="btb-credits-label">Balance</span>
              <span className="btb-credits-val">{walletState.remaining_credits} Credits</span>
            </div>
          )}

          <NotificationBell />

          <div className="btb-avatar">
            <div className="btb-avatar-circle">Br</div>
            <div>
              <div className="btb-avatar-name">Brand User</div>
              <div className="btb-avatar-role">{roleName}</div>
            </div>
          </div>
        </div>
      </div>
  );
}
