import { useState } from "react";
import { Loader2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import "./BookingConfirmationModal.css";
import { createBooking } from "../../services/campaignBookings";

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  format,
  timing,
  timingMode,
  customDate,
  customTime
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [creditType, setCreditType] = useState(null); // 'standard' | 'prime'

  if (!isOpen || !format) return null;

  const creditsRequired = creditType === 'prime' ? format.prime_credits : format.standard_credits;

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        format_slug: format.slug,
        business_type: timing?.business_type || "Generic",
        booking_date: timingMode === 'recommended' ? null : customDate,
        booking_time: timingMode === 'recommended' ? `${timing.best_day} | ${timing.prime_time_start} - ${timing.prime_time_end}` : customTime,
        timing_type: timingMode,
        credit_type: creditType,
        additional_notes: notes || null
      };

      await createBooking(payload);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    setNotes("");
    setCreditType(null);
    onSuccess();
  };

  if (isSuccess) {
    return (
      <div className="bcm-overlay">
        <div className="bcm-modal bcm-success-modal">
          <div className="bcm-success-icon-wrap">
            <CheckCircle2 size={48} className="bcm-success-icon" />
          </div>
          <h2 className="bcm-title bcm-success-title">Booking Submitted Successfully</h2>
          <div className="bcm-success-badge">Status: Pending Approval</div>
          <p className="bcm-success-text">Your booking has been received and is awaiting administrator review.</p>
          <div className="bcm-actions bcm-success-actions">
            <button className="bcm-btn-confirm" onClick={handleCloseSuccess}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bcm-overlay">
      <div className="bcm-modal">
        <button className="bcm-close" onClick={onClose} disabled={loading}>
          <X size={20} />
        </button>
        
        <h2 className="bcm-title">Confirm Booking</h2>
        <p className="bcm-subtitle">Please review your campaign details before confirming.</p>

        {error && (
          <div className="bcm-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="bcm-content">
          <div className="bcm-detail-row">
            <span className="bcm-label">Ad Format</span>
            <span className="bcm-value">{format.name}</span>
          </div>
          <div className="bcm-detail-row">
            <span className="bcm-label">Timing Type</span>
            <span className="bcm-value" style={{ textTransform: 'capitalize' }}>{timingMode}</span>
          </div>
          <div className="bcm-detail-row">
            <span className="bcm-label">Date</span>
            <span className="bcm-value">{timingMode === 'recommended' ? "TBD (Selected by Admin)" : customDate}</span>
          </div>
          <div className="bcm-detail-row">
            <span className="bcm-label">Time</span>
            <span className="bcm-value">{timingMode === 'recommended' ? `${timing.best_day} | ${timing.prime_time_start} - ${timing.prime_time_end}` : customTime}</span>
          </div>
          
          <div className="bcm-divider" />

          <div className="bcm-credit-type-section">
            <label className="bcm-label">Select Credit Type <span className="bcm-required">*</span></label>
            <div className="bcm-credit-options">
              <button
                className={`bcm-credit-btn ${creditType === 'standard' ? 'selected' : ''}`}
                onClick={() => setCreditType('standard')}
                disabled={loading}
              >
                <div className="bcm-credit-btn-title">Standard Credits</div>
                <div className="bcm-credit-btn-val">{format.standard_credits} Credits</div>
              </button>
              <button
                className={`bcm-credit-btn ${creditType === 'prime' ? 'selected' : ''}`}
                onClick={() => setCreditType('prime')}
                disabled={loading}
              >
                <div className="bcm-credit-btn-title">Prime Credits</div>
                <div className="bcm-credit-btn-val">{format.prime_credits} Credits</div>
              </button>
            </div>
          </div>

          <div className="bcm-detail-row">
            <span className="bcm-label">Credits Required</span>
            <span className="bcm-value bcm-highlight">{creditType ? `${creditsRequired} Credits` : "—"}</span>
          </div>
          <div className="bcm-detail-row">
            <span className="bcm-label">Remaining Inventory</span>
            <span className="bcm-value">{format.remaining_inventory} Slots</span>
          </div>
        </div>

        <div className="bcm-notes-group">
          <label className="bcm-label">Additional Notes (Optional)</label>
          <textarea 
            className="bcm-textarea"
            placeholder="e.g. Focus on festive audience, mention product launch..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="bcm-actions">
          <button className="bcm-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="bcm-btn-confirm" onClick={handleConfirm} disabled={loading || !creditType}>
            {loading ? <Loader2 size={18} className="bcm-loader" /> : <CheckCircle2 size={18} />}
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
