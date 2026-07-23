import { useState, useEffect, useMemo } from "react";
import { Loader2, RotateCcw, CheckCircle2, XCircle, MessageSquare, Search, X, Layers, Circle, Timer, Star, Ban } from "lucide-react";
import { fetchAllBookings, updateBookingStatus } from "../../services/campaignBookings";
import { fetchReports } from "../../services/reports";
import "./CampaignsPage.css";

const STATUS_COLOR = {
  pending:   "#fbbf24",
  approved:  "#38bdf8",
  completed: "#34d399",
  rejected:  "#f87171",
};

const PROGRESS_COLOR = {
  pending:   "linear-gradient(90deg,#fbbf24,#f59e0b)",
  approved:  "linear-gradient(90deg,#38bdf8,#0284c7)",
  completed: "linear-gradient(90deg,#34d399,#059669)",
  rejected:  "linear-gradient(90deg,#f87171,#dc2626)",
};

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

function StatusBadge({ status }) {
  const icons = {
    pending:   <Timer size={11} />,
    approved:  <CheckCircle2 size={11} />,
    completed: <Star size={11} />,
    rejected:  <Ban size={11} />,
  };
  return (
    <span className={`rpt-badge rpt-badge--${status}`}>
      {icons[status] || <Circle size={11} />}
      {status}
    </span>
  );
}

const isMissingTimingValue = (value) =>
  value === null || value === undefined || String(value).trim().toLowerCase() === "undefined" || String(value).trim() === "";

const displayTimingValue = (value) => (isMissingTimingValue(value) ? "TBD" : value);

export default function CampaignsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [reportData, setReportData] = useState(null);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [finalTime, setFinalTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  


  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, reportsRes] = await Promise.all([
        fetchAllBookings(),
        fetchReports()
      ]);
      setBookings(bookingsRes.data || []);
      setReportData(reportsRes || null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load campaign bookings.");
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

  const filteredBookings = bookings.filter((b) => b.booking_status === filter);

  const openReview = async (booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || "");
    setFinalDate(isMissingTimingValue(booking.booking_date) ? "" : booking.booking_date);
    setFinalTime(isMissingTimingValue(booking.booking_time) ? "" : booking.booking_time);
  };

  const clearReview = () => {
    setSelectedBooking(null);
    setAdminNotes("");
    setFinalDate("");
    setFinalTime("");
  };

  const replaceBooking = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.booking_id === updatedBooking.booking_id ? updatedBooking : booking
      )
    );
    setSelectedBooking(updatedBooking);
  };

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
      clearReview();

      window.dispatchEvent(new Event("refreshPendingCount"));

      loadBookings();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const response = await updateBookingStatus(selectedBooking.booking_id, {
        booking_status: selectedBooking.booking_status,
        admin_notes: adminNotes || null,
      });
      replaceBooking(response.data);
    } catch (err) {
      alert("Failed to save response: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };



  return (
    <div className="ca-page">
      <div className="ca-header">
        <div>
          <h1 className="ca-title">Campaigns</h1>
          <p className="ca-subtitle">Review and manage brand campaign bookings</p>
        </div>

        <div className="ca-filters">
          {["pending", "approved", "rejected", "completed"].map(status => (
            <button
              key={status}
              className={`ca-filter-btn ${filter === status ? "active" : ""}`}
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
                    <td>
                      <div>{b.brand_name || b.brand_id}</div>
                      {/* Check if any query exists in backend or just use a generic badge if we added a field, for now we will show this dynamically when they open review */}
                    </td>
                    <td>
                      <div className="ca-fmt">{b.format_slug}</div>
                      <div className="ca-biz">{b.business_type}</div>
                    </td>
                    <td className="ca-capitalize">{b.timing_type}</td>
                    <td>
                      <div>Date: {displayTimingValue(b.booking_date)}</div>
                      <div className="ca-biz">Time: {displayTimingValue(b.booking_time)}</div>
                    </td>
                    <td>
                      <button className="ca-view-btn" onClick={() => openReview(b)}>
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
                  <span className="ca-capitalize">{selectedBooking.timing_type}</span>
                </div>
                <div className="ca-detail">
                  <label>Credit Type</label>
                  <span className="ca-capitalize">{selectedBooking.credit_type || "Unknown"}</span>
                </div>
                <div className="ca-detail">
                  <label>Credits Used</label>
                  <span>{selectedBooking.credits_used} Credits</span>
                </div>
                <div className="ca-detail">
                  <label>Date</label>
                  <span>{displayTimingValue(selectedBooking.booking_date)}</span>
                </div>
                <div className="ca-detail">
                  <label>Time</label>
                  <span>{displayTimingValue(selectedBooking.booking_time)}</span>
                </div>
              </div>

              {selectedBooking.timing_type === "recommended" && selectedBooking.booking_status === "pending" && (
                <div className="ca-details-grid ca-final-grid">
                  <div className="ca-detail">
                    <label className="ca-final-label">Final Posting Date</label>
                    <input
                      type="date"
                      className="ca-admin-input"
                      value={finalDate}
                      onChange={e => setFinalDate(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="ca-detail">
                    <label className="ca-final-label">Final Posting Time</label>
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
                <label>Original Booking Notes</label>
                <div className="ca-brand-notes">
                  {selectedBooking.additional_notes || "No notes provided by the brand."}
                </div>
              </div>



              <div className="ca-notes-section">
                <label>Admin Notes</label>
                <textarea
                  className="ca-admin-textarea"
                  placeholder="Enter response, rejection reason, or approval notes..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="ca-actions">
              <button
                className="ca-btn ca-btn-cancel"
                onClick={clearReview}
                disabled={actionLoading}
              >
                Close
              </button>
              {selectedBooking.booking_status !== "pending" && (
                <button
                  className="ca-btn ca-btn-approve"
                  onClick={handleSaveResponse}
                  disabled={actionLoading}
                >
                  Save Response
                </button>
              )}

              {selectedBooking.booking_status === "pending" && (
                <>
                  <button
                    className="ca-btn ca-btn-reject"
                    onClick={() => handleAction("rejected")}
                    disabled={actionLoading}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button
                    className="ca-btn ca-btn-approve"
                    onClick={() => handleAction("approved")}
                    disabled={
                      actionLoading ||
                      (selectedBooking.timing_type === "recommended" && (!finalDate || !finalTime))
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

      {/* Overview Table */}
      <div style={{ marginTop: "32px" }}>
        <BrandCampaignOverview data={reportData?.brand_campaign_overview || []} />
      </div>
    </div>
  );
}
// SIDE DRAWER
// ══════════════════════════════════════════════════════════
function CampaignDrawer({ campaign, onClose }) {
  if (!campaign) return null;

  const progress = campaign.progress ?? 0;
  const progressColor = PROGRESS_COLOR[campaign.status] ?? "linear-gradient(90deg,#38bdf8,#0284c7)";

  return (
    <>
      <div className="rpt-drawer-overlay" onClick={onClose} />
      <div className="rpt-drawer">
        <div className="rpt-drawer-header">
          <h2 className="rpt-drawer-title">{campaign.campaign_name}</h2>
          <button className="rpt-drawer-close" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <div className="rpt-drawer-body">
          <div className="rpt-drawer-status-row">
            <StatusBadge status={campaign.status} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              ID #{campaign.booking_id}
            </span>
          </div>

          <div className="rpt-drawer-section">
            <div className="rpt-drawer-section-label">Brand Information</div>
            <div className="rpt-drawer-grid">
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Brand Name</div>
                <div className="rpt-drawer-field-value">{campaign.brand_name}</div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Business Type</div>
                <div className="rpt-drawer-field-value" style={{ textTransform: "capitalize" }}>
                  {campaign.business_type || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="rpt-drawer-section">
            <div className="rpt-drawer-section-label">Campaign Details</div>
            <div className="rpt-drawer-grid">
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Ad Format</div>
                <div className="rpt-drawer-field-value">{campaign.ad_format}</div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Credits Used</div>
                <div className="rpt-drawer-field-value rpt-drawer-field-value--accent">
                  {campaign.credits_used} Credits
                </div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Booking Date</div>
                <div className="rpt-drawer-field-value">{campaign.booking_date || "—"}</div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Booking Time</div>
                <div className="rpt-drawer-field-value">{campaign.booking_time || "—"}</div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Weekly Slot Remaining</div>
                <div className="rpt-drawer-field-value">
                  {campaign.weekly_slot_remaining != null
                    ? `${campaign.weekly_slot_remaining} / ${campaign.weekly_slot_limit ?? "?"}`
                    : "—"}
                </div>
              </div>
              <div className="rpt-drawer-field">
                <div className="rpt-drawer-field-label">Created At</div>
                <div className="rpt-drawer-field-value">{fmtDate(campaign.created_at)}</div>
              </div>
            </div>
          </div>

          <div className="rpt-drawer-progress">
            <div className="rpt-drawer-progress-header">
              <span>Campaign Progress</span>
              <span style={{ color: STATUS_COLOR[campaign.status] ?? "#fff", fontWeight: 700 }}>
                {progress}%
              </span>
            </div>
            <div className="rpt-drawer-progress-bar-bg">
              <div
                className="rpt-drawer-progress-fill"
                style={{ width: `${progress}%`, background: progressColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// BRAND CAMPAIGN OVERVIEW
// ══════════════════════════════════════════════════════════
function BrandCampaignOverview({ data }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterBusiness, setFilterBusiness] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const formats = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((d) => d.ad_format).filter(Boolean))].sort();
  }, [data]);

  const businessTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((d) => d.business_type).filter(Boolean))].sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((row) => {
      const matchSearch =
        !q ||
        row.brand_name?.toLowerCase().includes(q) ||
        row.campaign_name?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || row.status === filterStatus;
      const matchFormat = filterFormat === "all" || row.ad_format === filterFormat;
      const matchBusiness = filterBusiness === "all" || row.business_type === filterBusiness;
      return matchSearch && matchStatus && matchFormat && matchBusiness;
    });
  }, [data, search, filterStatus, filterFormat, filterBusiness]);

  return (
    <div className="rpt-card" style={{ "--glow": "#38bdf8" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Layers size={17} />
        Brand Campaign Overview
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
          All campaigns · click row for details
        </span>
      </div>

      <div className="rpt-filters">
        <div className="rpt-search-wrap">
          <Search size={14} className="rpt-search-icon" />
          <input
            className="rpt-search"
            placeholder="Search by brand or campaign name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rpt-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="rpt-filter-select"
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
        >
          <option value="all">All Formats</option>
          {formats.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          className="rpt-filter-select"
          value={filterBusiness}
          onChange={(e) => setFilterBusiness(e.target.value)}
        >
          <option value="all">All Business Types</option>
          {businessTypes.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <span className="rpt-filter-count">{filtered.length} results</span>
      </div>

      <div className="rpt-campaign-table-wrap">
        {filtered.length === 0 ? (
          <div className="rpt-empty">No campaigns match your filters.</div>
        ) : (
          <table className="rpt-campaign-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Campaign</th>
                <th>Ad Format</th>
                <th>Business Type</th>
                <th>Booking Date</th>
                <th>Booking Time</th>
                <th>Status</th>
                <th>Credits Used</th>
                <th>Weekly Slot</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const pct = row.progress ?? 0;
                const pColor = PROGRESS_COLOR[row.status] ?? "linear-gradient(90deg,#38bdf8,#0284c7)";
                return (
                  <tr key={row.booking_id} onClick={() => setSelectedCampaign(row)}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>{row.brand_name}</td>
                    <td style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{row.campaign_name}</td>
                    <td>{row.ad_format}</td>
                    <td style={{ textTransform: "capitalize" }}>{row.business_type || "—"}</td>
                    <td>{row.booking_date || "—"}</td>
                    <td>{row.booking_time || "—"}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td style={{ fontWeight: 600 }}>{row.credits_used}</td>
                    <td>
                      {row.weekly_slot_remaining != null ? (
                        <span className="rpt-weekly-slot">
                          <span className="rpt-weekly-slot-num">{row.weekly_slot_remaining}</span>
                          <span className="rpt-weekly-slot-label">
                            / {row.weekly_slot_limit ?? "?"} left
                          </span>
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <div className="rpt-progress-cell">
                        <div className="rpt-progress-bar-bg">
                          <div
                            className="rpt-progress-bar-fill"
                            style={{ width: `${pct}%`, background: pColor }}
                          />
                        </div>
                        <span className="rpt-progress-pct">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedCampaign && (
        <CampaignDrawer
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}


