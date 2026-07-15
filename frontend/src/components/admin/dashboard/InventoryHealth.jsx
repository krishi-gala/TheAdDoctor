import { LayoutTemplate } from "lucide-react";

export default function InventoryHealth({ data }) {
  if (!data) return null;

  return (
    <div className="dash-card">
      <h2 className="dash-card-title">
        <LayoutTemplate size={20} />
        Weekly Inventory Health
      </h2>
      
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600 }}>Total Used</div>
          <div style={{ fontSize: "24px", color: "#fff", fontWeight: 700 }}>{data.used} / {data.total}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600 }}>Overall Util.</div>
          <div style={{ fontSize: "24px", color: "#10b981", fontWeight: 700 }}>{data.utilization_percent}%</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
        {data.formats?.length > 0 ? (
          data.formats.map((fmt, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#fff", fontWeight: 500 }}>{fmt.name}</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{fmt.used} / {fmt.total} ({fmt.utilization}%)</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(100, fmt.utilization)}%`,
                    background: fmt.utilization > 80 ? "#ef4444" : fmt.utilization > 50 ? "#f59e0b" : "#10b981",
                    borderRadius: "3px",
                    transition: "width 1s ease-in-out"
                  }} 
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#a1a1aa", fontSize: "14px" }}>No inventory data.</div>
        )}
      </div>
    </div>
  );
}
