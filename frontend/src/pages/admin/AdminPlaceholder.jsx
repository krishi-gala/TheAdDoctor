import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, MessageSquare, Pencil, RotateCcw } from "lucide-react";
import { ADMIN_MENU_ITEMS } from "../../config/adminMenu";
import ConfirmModal from "../../components/admin/ConfirmModal";
import CampaignApproval from "./CampaignApproval";
import { fetchApprovedBookings, manageBooking, resolveBrandQuery } from "../../services/campaignBookings";
import "./AdminPlaceholder.css";

const isMissingTimingValue = (value) =>
  value === null || value === undefined || String(value).trim().toLowerCase() === "undefined" || String(value).trim() === "";

const displayTimingValue = (value) => (isMissingTimingValue(value) ? "TBD" : value);

const EMPTY_FORM = {
  format_slug: "",
  business_type: "",
  booking_date: "",
  booking_time: "",
  timing_type: "custom",
  credits_used: "",
  additional_notes: "",
  admin_notes: "",
};

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [completeBooking, setCompleteBooking] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchApprovedBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load approved bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const openEdit = (booking) => {
    setEditingBooking(booking);
    setForm({
      format_slug: booking.format_slug || "",
      business_type: booking.business_type || "",
      booking_date: isMissingTimingValue(booking.booking_date) ? "" : booking.booking_date,
      booking_time: isMissingTimingValue(booking.booking_time) ? "" : booking.booking_time,
      timing_type: booking.timing_type || "custom",
      credits_used: booking.credits_used ?? "",
      additional_notes: booking.additional_notes || "",
      admin_notes: booking.admin_notes || "",
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!editingBooking) return;

    setSaving(true);
    try {
      const response = await manageBooking(editingBooking.booking_id, {
        booking_status: "approved",
        business_type: form.business_type.trim(),
        final_date: form.booking_date || null,
        final_time: form.booking_time || null,
        timing_type: form.timing_type,
        credits_used: Number(form.credits_used),
        admin_notes: form.admin_notes.trim() || null,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === response.data.booking_id ? response.data : booking
        )
      );
      setEditingBooking(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert("Failed to update booking: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!completeBooking) return;

    setSaving(true);
    try {
      await manageBooking(completeBooking.booking_id, {
        booking_status: "completed",
      });

      setBookings((prev) =>
        prev.filter((booking) => booking.booking_id !== completeBooking.booking_id)
      );
      setCompleteBooking(null);
    } catch (err) {
      alert("Failed to complete campaign: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleResolveQuery = async () => {
    if (!editingBooking) return;

    setSaving(true);
    try {
      const response = await resolveBrandQuery(editingBooking.booking_id);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === response.data.booking_id ? response.data : booking
        )
      );
      setEditingBooking(response.data);
    } catch (err) {
      alert("Failed to resolve query: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ab-page">
      <div className="ab-header">
        <div>
          <h1 className="ab-title">Bookings</h1>
          <p className="ab-subtitle">Active approved campaigns ready for posting</p>
        </div>
      </div>

      <div className="ab-table-wrap">
        {loading ? (
          <div className="ab-state">
            <Loader2 size={24} className="ab-spinner" />
            Loading approved campaigns...
          </div>
        ) : error ? (
          <div className="ab-state ab-error">
            {error}
            <button type="button" className="ab-retry" onClick={loadBookings}>
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="ab-state">No approved campaigns found.</div>
        ) : (
          <table className="ab-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Ad Format</th>
                <th>Business Type</th>
                <th>Approved Date</th>
                <th>Approved Time</th>
                <th>Timing Type</th>
                <th>Credits Used</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.brand_name || booking.brand_id}</td>
                  <td>
                    <div className="ab-primary">{booking.format_slug}</div>
                  </td>
                  <td>{booking.business_type}</td>
                  <td>{displayTimingValue(booking.booking_date)}</td>
                  <td>{displayTimingValue(booking.booking_time)}</td>
                  <td className="ab-capitalize">{booking.timing_type}</td>
                  <td>{booking.credits_used} Credits</td>
                  <td>
                    <div className="ab-notes">
                      {booking.admin_notes || booking.additional_notes || "No notes"}
                    </div>
                  </td>
                  <td>
                    <div className="ab-status-stack">
                      <span className="ab-status approved">{booking.booking_status}</span>
                      {booking.brand_query && (
                        <span className="ab-query-badge">
                          <MessageSquare size={12} /> Brand Query Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="ab-actions">
                      <button
                        type="button"
                        className="ab-icon-btn"
                        onClick={() => openEdit(booking)}
                        title="Edit campaign"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="ab-complete-btn"
                        onClick={() => setCompleteBooking(booking)}
                      >
                        <CheckCircle2 size={15} /> Complete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingBooking && (
        <div className="ab-modal-overlay">
          <form className="ab-modal" onSubmit={handleSave}>
            <h2 className="ab-modal-title">Edit Approved Campaign</h2>

            <div className="ab-modal-body">
              <div className="ab-details-grid">
                <div className="ab-field">
                  <label>Brand Name</label>
                  <div className="ab-readonly">
                    {editingBooking.brand_name || editingBooking.brand_id}
                  </div>
                </div>
                <div className="ab-field">
                  <label>Ad Format</label>
                  <div className="ab-readonly">{form.format_slug}</div>
                </div>
                <div className="ab-field">
                  <label>Business Type</label>
                  <input
                    value={form.business_type}
                    onChange={(event) => handleChange("business_type", event.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="ab-field">
                  <label>Timing Type</label>
                  <select
                    value={form.timing_type}
                    onChange={(event) => handleChange("timing_type", event.target.value)}
                    disabled={saving}
                  >
                    <option value="custom">Custom</option>
                    <option value="recommended">Recommended</option>
                  </select>
                </div>
                <div className="ab-field">
                  <label>Approved Posting Date</label>
                  <input
                    type="date"
                    value={form.booking_date}
                    onChange={(event) => handleChange("booking_date", event.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="ab-field">
                  <label>Approved Posting Time</label>
                  <input
                    type="time"
                    value={form.booking_time}
                    onChange={(event) => handleChange("booking_time", event.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="ab-field">
                  <label>Credits Used</label>
                  <input
                    type="number"
                    min="0"
                    value={form.credits_used}
                    onChange={(event) => handleChange("credits_used", event.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              <div className="ab-notes-section">
                <label>Original Booking Notes</label>
                <div className="ab-readonly ab-notes-readonly">
                  {form.additional_notes || "No notes provided by the brand."}
                </div>
              </div>

              {editingBooking.brand_query && (
                <div className="ab-notes-section">
                  <label>Latest Brand Query</label>
                  <div className="ab-query-panel">
                    {editingBooking.brand_query}
                  </div>
                </div>
              )}

              <div className="ab-notes-section">
                <label>Admin Notes</label>
                <textarea
                  value={form.admin_notes}
                  onChange={(event) => handleChange("admin_notes", event.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="ab-modal-actions">
              <button
                type="button"
                className="ab-btn ab-btn-cancel"
                onClick={() => setEditingBooking(null)}
                disabled={saving}
              >
                Cancel
              </button>
              {editingBooking.brand_query && (
                <button
                  type="button"
                  className="ab-btn ab-btn-resolve"
                  onClick={handleResolveQuery}
                  disabled={saving}
                >
                  <CheckCircle2 size={16} /> Resolve Query
                </button>
              )}
              <button type="submit" className="ab-btn ab-btn-save" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(completeBooking)}
        title="Complete Campaign"
        message="Are you sure you want to mark this campaign as completed?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onCancel={() => setCompleteBooking(null)}
        onConfirm={handleComplete}
        loading={saving}
      />
    </div>
  );
}

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  
  if (pathname === '/admin/campaigns') {
    return <CampaignApproval />;
  }

  if (pathname === '/admin/bookings') {
    return <AdminBookings />;
  }

  const item = ADMIN_MENU_ITEMS.find((m) => m.path === pathname);
   
  return (
      <div className="ph-wrap">
        <h1 className="ph-title">{item?.label || "Section"}</h1>
        <p className="ph-text">
          This module is prepared for future release. Navigation and permissions
          are already wired — functionality will be added in the next phase.
        </p>
        <span className="ph-badge">Coming soon</span>
      </div>
  
  );
}
