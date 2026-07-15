import { Building2, Megaphone, IndianRupee, TrendingUp, Package } from "lucide-react";
import "./Statscards.css";

export default function StatsCards({ dashboardData }) {
const stats = [
  {
    icon: Building2,
    label: "Total Brands",
    value: dashboardData?.total_brands || 0,
    change: "+8 this month",
    positive: true,
    iconBg: "rgba(99,102,241,0.2)",
    iconColor: "#a5b4fc",
    glowColor: "rgba(99,102,241,0.15)",
    borderHover: "rgba(99,102,241,0.35)",
    tagBg: "rgba(99,102,241,0.15)",
    tagColor: "#a5b4fc",
    tagBorder: "rgba(99,102,241,0.3)",
  },
  {
    icon: Package,
    label: "Total Packages",
    value: dashboardData?.executive_summary?.total_packages ?? dashboardData?.total_packages ?? dashboardData?.total_packages_purchased ?? 0,
    change: "Active in system",
    positive: true,
    iconBg: "rgba(236,72,153,0.18)",
    iconColor: "#f472b6",
    glowColor: "rgba(236,72,153,0.12)",
    borderHover: "rgba(236,72,153,0.35)",
    tagBg: "rgba(236,72,153,0.12)",
    tagColor: "#f472b6",
    tagBorder: "rgba(236,72,153,0.25)",
  },
  {
    icon: Megaphone,
    label: "Active Campaigns",
    value: "42",
    change: "+5 this week",
    positive: true,
    iconBg: "rgba(167,139,250,0.2)",
    iconColor: "#c4b5fd",
    glowColor: "rgba(167,139,250,0.12)",
    borderHover: "rgba(167,139,250,0.35)",
    tagBg: "rgba(167,139,250,0.15)",
    tagColor: "#c4b5fd",
    tagBorder: "rgba(167,139,250,0.3)",
  },
  {
    icon: IndianRupee,
    label: "Revenue",
    value: "₹14.2L",
    change: "+12% vs last month",
    positive: true,
    iconBg: "rgba(45,212,191,0.18)",
    iconColor: "#5eead4",
    glowColor: "rgba(45,212,191,0.1)",
    borderHover: "rgba(45,212,191,0.35)",
    tagBg: "rgba(45,212,191,0.12)",
    tagColor: "#5eead4",
    tagBorder: "rgba(45,212,191,0.25)",
  },
  {
    icon: TrendingUp,
    label: "ROI Growth",
    value: "+31%",
    change: "↑ Above target",
    positive: true,
    iconBg: "rgba(56,189,248,0.18)",
    iconColor: "#7dd3fc",
    glowColor: "rgba(56,189,248,0.1)",
    borderHover: "rgba(56,189,248,0.35)",
    tagBg: "rgba(56,189,248,0.12)",
    tagColor: "#7dd3fc",
    tagBorder: "rgba(56,189,248,0.25)",
  },
];


  return (
    <div className="sc-grid">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div className="sc-card" key={s.label}>
            <div
              className="sc-card-bar"
              style={{ background: `linear-gradient(90deg, transparent, ${s.iconColor}, transparent)` }}
            />

            <div className="sc-top">
              <div className="sc-icon" style={{ background: s.iconBg }}>
                <Icon size={18} style={{ color: s.iconColor }} />
              </div>
              <span
                className="sc-tag"
                style={{ background: s.tagBg, color: s.tagColor, border: `1px solid ${s.tagBorder}` }}
              >
                {s.change.startsWith("+") || s.change.startsWith("↑") ? "↑" : "↓"} Live
              </span>
            </div>

            <div className="sc-label">{s.label}</div>
            <div className="sc-value">{s.value}</div>
            <div className={`sc-change${s.positive ? " sc-change-pos" : ""}`}>
              {s.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}
