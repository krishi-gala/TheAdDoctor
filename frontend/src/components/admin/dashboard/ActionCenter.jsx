import { BellRing, ShieldAlert, AlertTriangle, AlertCircle } from "lucide-react";

export default function ActionCenter({ data }) {
  if (!data) return null;

  return (
    <div className="dash-card">
      <h2 className="dash-card-title">
        <BellRing size={20} />
        Pending Approvals & Alerts
      </h2>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Pending Campaigns */}
        {data.pending_campaigns?.length > 0 && (
          <div className="ac-list">
            <div className="ac-list-title">Pending Campaigns</div>
            {data.pending_campaigns.map((c, i) => (
              <div key={i} className="ac-item">
                <div>
                  <div className="ac-item-main">Booking #{c.id}</div>
                  <div className="ac-item-sub">Brand ID: {c.brand_id} &bull; {c.format}</div>
                </div>
                <div className="ac-badge warning">Review</div>
              </div>
            ))}
          </div>
        )}

        {/* Low Inventory */}
        {data.low_inventory_slots?.length > 0 && (
          <div className="ac-list">
            <div className="ac-list-title">Low Inventory Alerts</div>
            {data.low_inventory_slots.map((inv, i) => (
              <div key={i} className="ac-item">
                <div>
                  <div className="ac-item-main">Format ID: {inv.format_id}</div>
                  <div className="ac-item-sub">{inv.remaining} / {inv.limit} slots remaining</div>
                </div>
                <div className="ac-badge danger">Low</div>
              </div>
            ))}
          </div>
        )}

        {/* Low Credit Brands */}
        {data.low_credit_brands?.length > 0 && (
          <div className="ac-list">
            <div className="ac-list-title">Low Credit Brands</div>
            {data.low_credit_brands.map((b, i) => (
              <div key={i} className="ac-item">
                <div>
                  <div className="ac-item-main">{b.brand_name}</div>
                  <div className="ac-item-sub">Only {b.remaining_credits} credits left</div>
                </div>
                <div className="ac-badge info">Top Up</div>
              </div>
            ))}
          </div>
        )}

        {/* Rejected Campaigns */}
        {data.rejected_campaigns?.length > 0 && (
          <div className="ac-list">
            <div className="ac-list-title">Recently Rejected</div>
            {data.rejected_campaigns.map((c, i) => (
              <div key={i} className="ac-item">
                <div>
                  <div className="ac-item-main">Booking #{c.id}</div>
                  <div className="ac-item-sub">Brand ID: {c.brand_id} &bull; {c.format}</div>
                </div>
                <div className="ac-badge danger">Rejected</div>
              </div>
            ))}
          </div>
        )}

        {(!data.pending_campaigns?.length && !data.low_inventory_slots?.length && !data.low_credit_brands?.length && !data.rejected_campaigns?.length) && (
          <div style={{ color: "#a1a1aa", fontSize: "14px" }}>All caught up! No pending actions.</div>
        )}
      </div>
    </div>
  );
}
