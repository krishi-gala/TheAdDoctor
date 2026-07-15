import { Target } from "lucide-react";

export default function CampaignOverview({ data }) {
  if (!data) return null;

  const total = (data.pending || 0) + (data.approved || 0) + (data.rejected || 0) + (data.completed || 0);

  const stats = [
    { label: "Approved", value: data.approved || 0, color: "#10b981" },
    { label: "Pending", value: data.pending || 0, color: "#f59e0b" },
    { label: "Completed", value: data.completed || 0, color: "#3b82f6" },
    { label: "Rejected", value: data.rejected || 0, color: "#ef4444" }
  ];

  return (
    <div className="dash-card">
      <h2 className="dash-card-title">
        <Target size={20} />
        Campaign Overview
      </h2>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>

        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Total Campaigns</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#fff" }}>{total}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {stats.map((stat, i) => {
            const percent = total > 0 ? Math.round((stat.value / total) * 100) : 0;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: stat.color }} />
                    <span style={{ color: "#e5e5e5", fontWeight: 500 }}>{stat.label}</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{stat.value} ({percent}%)</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${percent}%`,
                      background: stat.color,
                      borderRadius: "4px",
                      transition: "width 1s ease-in-out"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
