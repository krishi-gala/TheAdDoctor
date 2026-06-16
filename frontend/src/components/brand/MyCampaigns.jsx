import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Megaphone } from "lucide-react";
import { fetchMyBookings } from "../../services/campaignBookings";
import "./MyCampaigns.css";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchMyBookings();
      setCampaigns(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load campaigns."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="mc-wrap">
        <div className="mc-title-row">
          <h3 className="mc-title"><Megaphone size={20} className="mc-icon-inline" /> My Campaigns</h3>
          <p className="mc-subtitle">Track your ad format bookings and approval status</p>
        </div>

        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th className="mc-col-fmt">Ad Format</th>
                <th className="mc-col-date">Date & Time</th>
                <th className="mc-col-type">Timing Type</th>
                <th className="mc-col-notes">Admin Notes</th>
                <th className="mc-col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="mc-loading">
                      <Loader2 size={20} className="mc-loading-spinner" />
                      Loading campaigns...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5}>
                    <div className="mc-error">
                      {error}
                      <br />
                      <button type="button" className="mc-retry-btn" onClick={loadCampaigns}>
                        <RotateCcw size={14} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="mc-empty">No campaign bookings found. Go to Ad Formats to start booking!</div>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.booking_id}>
                    <td>
                      <div className="mc-fmt">{camp.format_slug}</div>
                      <div className="mc-biz">{camp.business_type}</div>
                    </td>
                    <td>
                      <div className="mc-date">{camp.booking_date}</div>
                      <div className="mc-time">{camp.booking_time}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{camp.timing_type}</td>
                    <td>
                      <span className="mc-notes" title={camp.admin_notes}>
                        {camp.admin_notes || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`mc-status-badge ${camp.booking_status.toLowerCase()}`}>
                        {camp.booking_status === "pending" ? "Pending Approval" : camp.booking_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
