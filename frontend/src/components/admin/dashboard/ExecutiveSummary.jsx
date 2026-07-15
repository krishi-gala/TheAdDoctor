import { Building2, Megaphone, Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExecutiveSummary({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const cards = [
    {
      label: "Total Brands",
      value: data.total_brands,
      icon: <Building2 size={20} />,
      color: "#3b82f6", // blue
      link: "/admin/brands"
    },
    {
      label: "Active Campaigns",
      value: data.active_campaigns,
      icon: <Megaphone size={20} />,
      color: "#10b981", // green
      link: "/admin/bookings"
    },
    {
      label: "Pending Approvals",
      value: data.pending_approvals,
      icon: <Clock size={20} />,
      color: "#f59e0b", // yellow
      link: "/admin/campaigns"
    },
    {
      label: "Total Packages",
      value: data?.total_packages ?? data?.total_packages_purchased ?? 0,
      icon: <Package size={20} />,
      color: "#8b5cf6", // purple
      link: "/admin/packages"
    }
  ];

  return (
    <>
      {cards.map((c, i) => (
        <div
          key={i}
          className="exec-stat-card"
          style={{ cursor: "pointer", transition: "transform 0.2s, background 0.2s" }}
          onClick={() => navigate(c.link)}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div className="exec-stat-lbl">
            <div style={{ color: c.color, display: "flex" }}>{c.icon}</div>
            {c.label}
          </div>
          <div className="exec-stat-val">{c.value}</div>
        </div>
      ))}
    </>
  );
}
