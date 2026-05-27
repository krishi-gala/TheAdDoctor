import { useLocation } from "react-router-dom";
import { ADMIN_MENU_ITEMS } from "../../config/adminMenu";

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  const item = ADMIN_MENU_ITEMS.find((m) => m.path === pathname);

  return (
    <>
      <style>{`
        .ph-wrap {
          margin-top: 8px;
          padding: 48px 32px;
          text-align: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          backdrop-filter: blur(18px);
        }
        .ph-title { font-size: 22px; font-weight: 700; color: #fff; }
        .ph-text {
          margin-top: 10px; font-size: 14px;
          color: rgba(255,255,255,0.45); max-width: 420px; margin-inline: auto;
        }
        .ph-badge {
          display: inline-block; margin-top: 20px;
          padding: 8px 16px; border-radius: 999px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(167,139,250,0.3);
          color: #c4b5fd; font-size: 12px; font-weight: 600;
        }
      `}</style>

      <div className="ph-wrap">
        <h1 className="ph-title">{item?.label || "Section"}</h1>
        <p className="ph-text">
          This module is prepared for future release. Navigation and permissions
          are already wired — functionality will be added in the next phase.
        </p>
        <span className="ph-badge">Coming soon</span>
      </div>
    </>
  );
}
