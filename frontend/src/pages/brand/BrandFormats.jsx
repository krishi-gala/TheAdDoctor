import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2, TrendingUp, Activity, Star, Calendar, Clock, ChevronLeft, CheckCircle2 } from "lucide-react";
import { fetchBrandAdFormats } from "../../services/adFormats";
import { fetchSmartTimingRecommendation } from "../../services/smartTiming";
import BookingConfirmationModal from "../../components/brand/BookingConfirmationModal";
import "./BrandFormats.css";

export default function BrandFormats() {
  const { reloadWallet } = useOutletContext() || {};
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Smart Timing State
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [timingsList, setTimingsList] = useState([]);
  const [selectedTiming, setSelectedTiming] = useState(null);
  const [timingLoading, setTimingLoading] = useState(false);
  const [timingMode, setTimingMode] = useState("recommended"); // 'recommended' | 'custom'
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [timingError, setTimingError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadFormats = async () => {
      try {
        setLoading(true);
        const res = await fetchBrandAdFormats();
        setFormats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFormats();
  }, []);

  const handleSelectFormat = async (format) => {
    setSelectedFormat(format);
    setTimingLoading(true);
    setTimingError("");
    setTimingMode("recommended");
    setSelectedTiming(null);
    setTimingsList([]);
    
    try {
      const res = await fetchSmartTimingRecommendation(format.slug);
      const list = Array.isArray(res.data) ? res.data : [res.data];
      setTimingsList(list);
      if (list.length === 1) setSelectedTiming(list[0]);
    } catch (err) {
      console.error(err);
      setTimingError("Timing recommendations unavailable.");
      const fallback = [{
        recommendation_id: null,
        best_day: "Wednesday",
        prime_time: "12 PM - 3 PM",
        high_engagement_window: "Tuesday–Thursday Afternoon",
        source: "fallback"
      }];
      setTimingsList(fallback);
      setSelectedTiming(fallback[0]);
    } finally {
      setTimingLoading(false);
    }
  };

  const handleBackToFormats = () => {
    setSelectedFormat(null);
    setTimingsList([]);
    setSelectedTiming(null);
  };

  if (selectedFormat) {
    return (
      <>
        <div className="st-header">
          <button className="st-back-btn" onClick={handleBackToFormats}><ChevronLeft size={20} /></button>
          <div>
            <h2 className="st-title">Configure Timing</h2>
            <div className="st-subtitle">Format: {selectedFormat.name}</div>
          </div>
        </div>

        <div className="st-card">
          <div className="st-toggle-group">
            <button 
              className={`st-toggle-btn ${timingMode === 'recommended' ? 'active' : ''}`}
              onClick={() => setTimingMode('recommended')}
            >
              Recommended Timing
            </button>
            <button 
              className={`st-toggle-btn ${timingMode === 'custom' ? 'active' : ''}`}
              onClick={() => setTimingMode('custom')}
            >
              Custom Timing
            </button>
          </div>

          {timingLoading ? (
            <div className="bf-loader bf-loader-compact">
              <Loader2 size={30} className="bf-loader-icon" />
              <span>Analyzing best times...</span>
            </div>
          ) : (
            <>
              {timingError && <div className="bf-error">{timingError}</div>}
              
              {timingMode === 'recommended' && (
                <>
                  {timingsList.length === 0 ? (
                    <div className="bf-loader">
                      <span>No timing recommendations available for your business type.</span>
                    </div>
                  ) : (
                    <>
                      {timingsList.length > 1 && (
                        <p className="st-pick-label">
                          {timingsList.length} timing options available — pick one:
                        </p>
                      )}
                      <div className="st-timing-options">
                        {timingsList.map((timing, idx) => {
                          const isSelected = selectedTiming === timing;
                          return (
                            <div
                              key={timing.recommendation_id ?? idx}
                              className={`st-timing-option ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedTiming(timing)}
                            >
                              <div className="st-timing-option-check">
                                <CheckCircle2
                                  size={20}
                                  className={`st-check-icon ${isSelected ? 'visible' : ''}`}
                                />
                              </div>
                              <div className="st-rec-grid">
                                <div className="st-info-box">
                                  <div className="st-info-label">Best Day</div>
                                  <div className="st-info-val">{timing.best_day}</div>
                                </div>
                                <div className="st-info-box">
                                  <div className="st-info-label">Prime Time</div>
                                  <div className="st-info-val">{timing.prime_time}</div>
                                </div>
                                <div className="st-info-box full">
                                  <div className="st-info-label">High Engagement Window</div>
                                  <div className="st-info-val">{timing.high_engagement_window}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="st-action">
                        <button className="st-submit" disabled={!selectedTiming} onClick={() => setIsModalOpen(true)}>
                          Confirm Selection
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {timingMode === 'custom' && (
                <>
                  <div className="st-rec-grid">
                    <div className="st-form-group">
                      <label className="st-label"><Calendar size={14} className="st-label-icon" /> Select Date</label>
                      <input 
                        type="date" 
                        className="st-input"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                    <div className="st-form-group">
                      <label className="st-label"><Clock size={14} className="st-label-icon" /> Select Time</label>
                      <input 
                        type="time" 
                        className="st-input"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="st-action">
                    <button className="st-submit" disabled={!customDate || !customTime} onClick={() => setIsModalOpen(true)}>
                      Confirm Selection
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <BookingConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            handleBackToFormats();
            setCustomDate("");
            setCustomTime("");
            setTimingMode("recommended");
            if (reloadWallet) {
              reloadWallet();
            }
            // Automatically refresh formats to get updated inventory
            const loadFormats = async () => {
              try {
                const res = await fetchBrandAdFormats();
                setFormats(res.data);
              } catch (err) {}
            };
            loadFormats();
          }}
          format={selectedFormat}
          timing={selectedTiming}
          timingMode={timingMode}
          customDate={customDate}
          customTime={customTime}
        />
      </>
    );
  }

  return (
    <>
      <div className="bf-header-block">
        <h1 className="bf-title">Ad Formats</h1>
        <p className="bf-subtitle">
          Available advertising formats for this week.
        </p>
      </div>

      {loading ? (
        <div className="bf-loader bf-loader-main">
          <Loader2 size={36} className="bf-loader-icon" />
          <span>Loading formats...</span>
        </div>
      ) : (
        <div className="bf-grid">
          {formats.map((format) => (
            <div key={format.format_id} className={`bf-card ${format.sold_out ? 'bf-sold-out' : ''}`}>
              {format.sold_out && <div className="bf-badge">Sold Out</div>}
              
              <div className="bf-card-title">{format.name}</div>
              
              <div className="bf-row">
                <TrendingUp size={16} className="bf-icon blue" />
                <span>Performance: {format.estimated_performance || "Unknown"}</span>
              </div>
              
              <div className="bf-row">
                <Activity size={16} className="bf-icon green" />
                <span>{format.standard_credits} Standard Credits</span>
              </div>
              
              <div className="bf-row">
                <Star size={16} className="bf-icon gold" />
                <span>{format.prime_credits} Prime Credits</span>
              </div>

              <div className="bf-divider" />

              <div className="bf-footer">
                <div className={`bf-remaining ${format.sold_out ? 'empty' : 'avail'}`}>
                  {format.remaining_inventory} / {format.weekly_limit} remaining
                </div>
                <button className="bf-btn" disabled={format.sold_out} onClick={() => handleSelectFormat(format)}>
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
