import { useEffect, useState } from "react";
import { Loader2, Megaphone, MessageSquare, RotateCcw } from "lucide-react";
import { fetchMyBookings, submitBrandQuery } from "../../services/campaignBookings";
import "./MyCampaigns.css";

const isMissingTimingValue = (value) =>
  value === null || value === undefined || String(value).trim().toLowerCase() === "undefined" || String(value).trim() === "";

const displayTimingValue = (value) => (isMissingTimingValue(value) ? "TBD" : value);

const hasActiveQuery = (campaign) =>
  campaign.brand_query !== null && campaign.brand_query !== undefined && String(campaign.brand_query).trim() !== "";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryBooking, setQueryBooking] = useState(null);
  const [queryMessage, setQueryMessage] = useState("");
  const [queryError, setQueryError] = useState("");
  const [querySaving, setQuerySaving] = useState(false);

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
    const timer = window.setTimeout(() => {
      loadCampaigns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const formatDate = (dateStr) => {
    if (isMissingTimingValue(dateStr)) return "TBD";
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

  const openQueryModal = (campaign) => {
    if (hasActiveQuery(campaign)) return;
    setQueryBooking(campaign);
    setQueryMessage(campaign.brand_query || "");
    setQueryError("");
  };

  const renderQueryState = (camp) => {
    if (camp.booking_status !== "approved") {
      return <span className="mc-muted-action">-</span>;
    }

    if (hasActiveQuery(camp)) {
      return (
        <span className="mc-query-state mc-query-state-pending">
          <MessageSquare size={12} />
          Query Raised - Pending Admin Response
        </span>
      );
    }

    return (
      <div className="mc-query-actions">
        {camp.brand_query_resolved && (
          <span className="mc-query-state mc-query-state-resolved">
            Query Resolved
          </span>
        )}
        <button type="button" className="mc-query-btn" onClick={() => openQueryModal(camp)}>
          <MessageSquare size={14} />
          Raise Query
        </button>
      </div>
    );
  };

  const closeQueryModal = () => {
    setQueryBooking(null);
    setQueryMessage("");
    setQueryError("");
  };

  const handleSubmitQuery = async (event) => {
    event.preventDefault();
    const cleanedQuery = queryMessage.trim();
    if (!cleanedQuery) {
      setQueryError("Please enter a query message.");
      return;
    }

    setQuerySaving(true);
    setQueryError("");
    try {
      const response = await submitBrandQuery(queryBooking.booking_id, cleanedQuery);
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.booking_id === response.data.booking_id ? response.data : campaign
        )
      );
      closeQueryModal();
    } catch (err) {
      setQueryError(err.response?.data?.detail || "Failed to submit query.");
    } finally {
      setQuerySaving(false);
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
                <th className="mc-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="mc-loading">
                      <Loader2 size={20} className="mc-loading-spinner" />
                      Loading campaigns...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
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
                  <td colSpan={6}>
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
                      <div className="mc-date">Date: {formatDate(camp.booking_date)}</div>
                      <div className="mc-time">Time: {displayTimingValue(camp.booking_time)}</div>
                    </td>
                    <td className="mc-capitalize">{camp.timing_type}</td>
                    <td>
                      <span className="mc-notes" title={camp.admin_notes}>
                        {camp.admin_notes || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`mc-status-badge ${camp.booking_status.toLowerCase()}`}>
                        {camp.booking_status === "pending" ? "Pending Approval" : camp.booking_status}
                      </span>
                    </td>
                    <td>
                      {renderQueryState(camp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {queryBooking && (
        <div className="mc-modal-overlay">
          <form className="mc-modal" onSubmit={handleSubmitQuery}>
            <h2 className="mc-modal-title">Raise Query</h2>
            <div className="mc-modal-body">
              <div className="mc-query-context">
                <div className="mc-fmt">{queryBooking.format_slug}</div>
                <div className="mc-biz">{queryBooking.business_type}</div>
              </div>
              <label className="mc-query-label" htmlFor="brand-query-message">Query Message</label>
              <textarea
                id="brand-query-message"
                className="mc-query-textarea"
                placeholder="Request timing change, date change, clarification, or share a campaign concern..."
                value={queryMessage}
                onChange={(event) => setQueryMessage(event.target.value)}
                disabled={querySaving}
              />
              {queryError && <div className="mc-query-error">{queryError}</div>}
            </div>
            <div className="mc-modal-actions">
              <button type="button" className="mc-modal-btn mc-modal-cancel" onClick={closeQueryModal} disabled={querySaving}>
                Cancel
              </button>
              <button type="submit" className="mc-modal-btn mc-modal-submit" disabled={querySaving}>
                {querySaving ? "Submitting..." : "Submit Query"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
