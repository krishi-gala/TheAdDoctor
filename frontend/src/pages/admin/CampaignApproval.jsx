import { useState, useEffect } from "react";
import { Loader2, RotateCcw, Megaphone, CheckCircle2, XCircle } from "lucide-react";
import { fetchAllBookings, updateBookingStatus } from "../../services/campaignBookings";
import "./CampaignApproval.css";

export default function CampaignApproval() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [finalTime, setFinalTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load campaign bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => b.booking_status === filter);

  const handleAction = async (status) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await updateBookingStatus(selectedBooking.booking_id, {
        booking_status: status,
        admin_notes: adminNotes || null,
        final_date: finalDate || null,
        final_time: finalTime || null
      });
      setSelectedBooking(null);
      setAdminNotes("");
      setFinalDate("");
      setFinalTime("");
      
      // Dispatch custom event to refresh sidebar pending count
      window.dispatchEvent(new Event("refreshPendingCount"));

      loadBookings();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="ca-page">
      <div className="ca-header">
        <div>
          <h1 className="ca-title">Campaign Approval</h1>
          <p className="ca-subtitle">Review and manage brand campaign bookings</p>
        </div>
        
        <div className="ca-filters">
          {["pending", "approved", "rejected", "completed"].map(status => (
            <button
              key={status}
              className={`ca-filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-content">
        <div className="ca-table-wrap">
          {loading ? (
            <div className="ca-loader"><Loader2 size={24} className="ca-spinner" /> Loading bookings...</div>
          ) : error ? (
            <div className="ca-error">
              {error}
              <button className="ca-retry" onClick={loadBookings}><RotateCcw size={16} /> Retry</button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="ca-empty">No {filter} bookings found.</div>
          ) : (
            <table className="ca-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Ad Format</th>
                  <th>Timing Type</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.booking_id}>
                    <td>{b.brand_name || b.brand_id}</td>
                    <td>
                      <div className="ca-fmt">{b.format_slug}</div>
                      <div className="ca-biz">{b.business_type}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{b.timing_type}</td>
                    <td>
                      <div>{b.booking_date}</div>
                      <div className="ca-biz">{b.booking_time}</div>
                    </td>
                    <td>
                      <button className="ca-view-btn" onClick={() => setSelectedBooking(b)}>
                        Review Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="ca-modal-overlay">
          <div className="ca-modal">
            <h2 className="ca-modal-title">Review Booking</h2>
            
            <div className="ca-modal-body">
              <div className="ca-details-grid">
                <div className="ca-detail">
                  <label>Brand Name</label>
                  <span>{selectedBooking.brand_name || selectedBooking.brand_id}</span>
                </div>
                <div className="ca-detail">
                  <label>Format</label>
                  <span>{selectedBooking.format_slug}</span>
                </div>
                <div className="ca-detail">
                  <label>Business Type</label>
                  <span>{selectedBooking.business_type}</span>
                </div>
                <div className="ca-detail">
                  <label>Timing Type</label>
                  <span style={{ textTransform: 'capitalize' }}>{selectedBooking.timing_type}</span>
                </div>
                <div className="ca-detail">
                  <label>Credit Type</label>
                  <span style={{ textTransform: 'capitalize' }}>{selectedBooking.credit_type || 'Unknown'}</span>
                </div>
                <div className="ca-detail">
                  <label>Credits Used</label>
                  <span>{selectedBooking.credits_used} Credits</span>
                </div>
                <div className="ca-detail">
                  <label>Date</label>
                  <span>{selectedBooking.booking_date || "TBD"}</span>
                </div>
                <div className="ca-detail">
                  <label>Time</label>
                  <span>{selectedBooking.booking_time}</span>
                </div>
              </div>

              {selectedBooking.timing_type === 'recommended' && selectedBooking.booking_status === 'pending' && (
                <div className="ca-details-grid" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <div className="ca-detail">
                    <label style={{ color: '#60a5fa' }}>Final Posting Date</label>
                    <input 
                      type="date" 
                      className="ca-admin-input" 
                      value={finalDate}
                      onChange={e => setFinalDate(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="ca-detail">
                    <label style={{ color: '#60a5fa' }}>Final Posting Time</label>
                    <input 
                      type="time" 
                      className="ca-admin-input" 
                      value={finalTime}
                      onChange={e => setFinalTime(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                </div>
              )}

              <div className="ca-notes-section">
                <label>Brand's Additional Notes</label>
                <div className="ca-brand-notes">
                  {selectedBooking.additional_notes || "No notes provided by the brand."}
                </div>
              </div>

              <div className="ca-notes-section">
                <label>Admin Notes</label>
                <textarea
                  className="ca-admin-textarea"
                  placeholder="Enter reason for rejection or approval notes..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="ca-actions">
              <button 
                className="ca-btn ca-btn-cancel" 
                onClick={() => setSelectedBooking(null)}
                disabled={actionLoading}
              >
                Close
              </button>
              {selectedBooking.booking_status === 'pending' && (
                <>
                  <button 
                    className="ca-btn ca-btn-reject" 
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button 
                    className="ca-btn ca-btn-approve" 
                    onClick={() => handleAction('approved')}
                    disabled={
                      actionLoading || 
                      (selectedBooking.timing_type === 'recommended' && (!finalDate || !finalTime))
                    }
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
