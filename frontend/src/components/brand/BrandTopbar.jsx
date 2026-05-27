import { Bell } from "lucide-react";
import { getRole } from "../../services/auth";

export default function BrandTopbar({ pageTitle = "Dashboard", walletState }) {
  const roleName = getRole() === "brand" ? "Brand Partner" : "Client";

  return (
    <>
      <style>{`
        .btb-root {
          display: flex; justify-content: space-between; align-items: center;
          position: relative; z-index: 2;
        }

        .btb-left {}
        .btb-greeting {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(14,165,233,0.25);
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: #38bdf8; margin-bottom: 8px;
        }
        .btb-greeting-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #38bdf8;
        }
        .btb-title {
          font-size: 28px; font-weight: 800; color: #fff; line-height: 1.1;
        }
        .btb-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }

        .btb-right { display: flex; align-items: center; gap: 16px; }

        .btb-credits-badge {
          display: flex; flex-direction: column; align-items: flex-end;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 6px 14px;
          backdrop-filter: blur(12px);
        }
        .btb-credits-label { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; text-transform: uppercase; }
        .btb-credits-val { font-size: 14px; color: #38bdf8; font-weight: 700; }

        .btb-bell {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: background 0.15s; position: relative;
          backdrop-filter: blur(12px);
        }
        .btb-bell:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .btb-avatar {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 7px 14px 7px 8px;
          backdrop-filter: blur(12px);
        }
        .btb-avatar-circle {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .btb-avatar-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .btb-avatar-role { font-size: 10px; color: rgba(255,255,255,0.35); }
      `}</style>

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
          {walletState && walletState.credits_remaining !== undefined && (
            <div className="btb-credits-badge">
              <span className="btb-credits-label">Balance</span>
              <span className="btb-credits-val">{walletState.credits_remaining} Credits</span>
            </div>
          )}

          <div className="btb-bell">
            <Bell size={16} />
          </div>

          <div className="btb-avatar">
            <div className="btb-avatar-circle">Br</div>
            <div>
              <div className="btb-avatar-name">Brand User</div>
              <div className="btb-avatar-role">{roleName}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
