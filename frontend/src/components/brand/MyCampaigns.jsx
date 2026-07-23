import { useEffect, useState } from "react";
import { Loader2, Megaphone, MessageSquare, RotateCcw } from "lucide-react";
import { fetchMyBookings, submitBrandQuery, fetchQueriesForBooking } from "../../services/campaignBookings";
import "./MyCampaigns.css";

const isMissingTimingValue = (value) =>
  value === null || value === undefined || String(value).trim().toLowerCase() === "undefined" || String(value).trim() === "";

const displayTimingValue = (value) => (isMissingTimingValue(value) ? "TBD" : value);

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryBooking, setQueryBooking] = useState(null);
  const [bookingQueries, setBookingQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  
  const [querySubject, setQuerySubject] = useState("");
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

  const openQueryModal = async (campaign) => {
    setQueryBooking(campaign);
    setQuerySubject("");
    setQueryMessage("");
    setQueryError("");
    setBookingQueries([]);
    setQueriesLoading(true);

    try {
      const res = await fetchQueriesForBooking(campaign.booking_id);
      setBookingQueries(res.data || []);
    } catch (err) {
      console.error("Failed to load queries", err);
    } finally {
      setQueriesLoading(false);
    }
  };

  const renderQueryState = (camp) => {
    if (camp.booking_status !== "approved") {
      return <span className="mc-muted-action">-</span>;
    }

    return (
      <div className="mc-query-actions">
        <button type="button" className="mc-query-btn" onClick={() => openQueryModal(camp)}>
          <MessageSquare size={14} />
          View Details & Queries
        </button>
      </div>
    );
  };

  const closeQueryModal = () => {
    setQueryBooking(null);
    setQuerySubject("");
    setQueryMessage("");
    setQueryError("");
    setBookingQueries([]);
  };

  const handleSubmitQuery = async (event) => {
    event.preventDefault();
    const cleanedSubject = querySubject.trim();
    const cleanedMessage = queryMessage.trim();
    if (!cleanedSubject || !cleanedMessage) {
      setQueryError("Please enter both subject and message.");
      return;
    }

    setQuerySaving(true);
    setQueryError("");
    try {
      const response = await submitBrandQuery(queryBooking.booking_id, cleanedSubject, cleanedMessage);
      setBookingQueries(prev => [...prev, response.data]);
      setQuerySubject("");
      setQueryMessage("");
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
          <div className="mc-modal">
            <h2 className="mc-modal-title">Campaign Details</h2>
            <div className="mc-modal-body">
              <div className="mc-query-context">
                <div className="mc-fmt">{queryBooking.format_slug}</div>
                <div className="mc-biz">{queryBooking.business_type}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  Booking ID: #{queryBooking.booking_id} • Status: <span style={{textTransform: 'capitalize'}}>{queryBooking.booking_status}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '15px', margin: '0 0 16px 0', color: '#fff' }}>Query History</h3>
              
              {queriesLoading ? (
                <div className="mc-loading" style={{ padding: '20px' }}>
                  <Loader2 size={16} className="mc-loading-spinner" />
                  Loading history...
                </div>
              ) : bookingQueries.length === 0 ? (
                <div className="mc-empty" style={{ padding: '20px', marginBottom: '24px' }}>
                  No queries have been raised for this campaign yet.
                </div>
              ) : (
                <div className="mc-query-history">
                  {bookingQueries.map(q => (
                    <div key={q.query_id} className="mc-query-item">
                      <div className="mc-query-header">
                        <div className="mc-query-subject">{q.subject}</div>
                        <div className="mc-query-date">{formatDate(q.created_at)}</div>
                      </div>
                      <div className="mc-query-message">{q.message}</div>
                      
                      {q.admin_reply && (
                        <div className="mc-query-admin-reply">
                          <div className="mc-reply-label">Admin Reply</div>
                          <div className="mc-reply-text">{q.admin_reply}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {bookingQueries.some(q => q.status === "open") ? (
                <div style={{ padding: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid #f59e0b', borderRadius: '6px', color: '#fbbf24', fontSize: '13px', marginTop: '16px' }}>
                  You currently have a pending query. Please wait for the admin to resolve it before raising a new one.
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '15px', margin: '0 0 16px 0', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>Raise a New Query</h3>
                  <form onSubmit={handleSubmitQuery} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label className="mc-query-label" htmlFor="brand-query-subject">Subject</label>
                      <input
                        id="brand-query-subject"
                        className="mc-query-textarea"
                        style={{ minHeight: 'auto', padding: '10px 12px' }}
                        placeholder="E.g. Request timing change"
                        value={querySubject}
                        onChange={(event) => setQuerySubject(event.target.value)}
                        disabled={querySaving}
                      />
                    </div>
                    <div>
                      <label className="mc-query-label" htmlFor="brand-query-message">Message</label>
                      <textarea
                        id="brand-query-message"
                        className="mc-query-textarea"
                        placeholder="Provide details about your query..."
                        value={queryMessage}
                        onChange={(event) => setQueryMessage(event.target.value)}
                        disabled={querySaving}
                      />
                    </div>
                    {queryError && <div className="mc-query-error">{queryError}</div>}
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="submit" className="mc-modal-btn mc-modal-submit" disabled={querySaving || !querySubject.trim() || !queryMessage.trim()}>
                        {querySaving ? "Submitting..." : "Send Query"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
            
            <div className="mc-modal-actions">
              <button type="button" className="mc-modal-btn mc-modal-cancel" onClick={closeQueryModal} disabled={querySaving}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
