import { useLocation } from "react-router-dom";
import { ADMIN_MENU_ITEMS } from "../../config/adminMenu";
import CampaignApproval from "./CampaignApproval";
import "./AdminPlaceholder.css";

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  
  if (pathname === '/admin/campaigns') {
    return <CampaignApproval />;
  }

  const item = ADMIN_MENU_ITEMS.find((m) => m.path === pathname);
   
  return (
      <div className="ph-wrap">
        <h1 className="ph-title">{item?.label || "Section"}</h1>
        <p className="ph-text">
          This module is prepared for future release. Navigation and permissions
          are already wired — functionality will be added in the next phase.
        </p>
        <span className="ph-badge">Coming soon</span>
      </div>
  
  );
}
