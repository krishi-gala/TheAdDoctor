import { Activity } from "lucide-react";

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  if (interval === 1) return "1 year ago";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  if (interval === 1) return "1 month ago";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "1 day ago";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  if (interval === 1) return "1 hour ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  if (interval === 1) return "1 minute ago";

  return "Just now";
}

export default function LiveOperations({ data = [] }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "success": return "#10b981"; // green
      case "error": return "#ef4444";   // red
      case "warning": return "#f59e0b"; // yellow
      default: return "#3b82f6";        // blue
    }
  };

  return (
    <div className="dash-card" style={{ maxHeight: "400px" }}>
      <h2 className="dash-card-title">
        <Activity size={20} />
        Live Operations
      </h2>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {data && data.length > 0 ? (
          data.map((op) => (
            <div 
              key={op.id} 
              style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "12px", 
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                paddingBottom: "16px"
              }}
            >
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%",
                backgroundColor: getSeverityColor(op.severity),
                marginTop: "6px",
                flexShrink: 0,
                boxShadow: `0 0 10px ${getSeverityColor(op.severity)}`
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
                  {op.action.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: 1.4, marginBottom: "6px" }}>
                  {op.description}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                  {timeAgo(op.time)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#a1a1aa", fontSize: "14px" }}>No recent activity.</div>
        )}
      </div>
    </div>
  );
}
