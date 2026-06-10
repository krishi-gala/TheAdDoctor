import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, Star, Calendar, Clock, ChevronLeft } from "lucide-react";
import { fetchBrandAdFormats } from "../../services/adFormats";
import { fetchSmartTimingRecommendation } from "../../services/smartTiming";
import "./BrandFormats.css";

export default function BrandFormats() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Smart Timing State
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [timingData, setTimingData] = useState(null);
  const [timingLoading, setTimingLoading] = useState(false);
  const [timingMode, setTimingMode] = useState("recommended"); // 'recommended' | 'custom'
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [timingError, setTimingError] = useState("");

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
    
    try {
      const res = await fetchSmartTimingRecommendation(format.slug);
      setTimingData(res.data);
    } catch (err) {
      console.error(err);
      setTimingError("Timing recommendations unavailable.");
      // Fallback local data if API fails completely so it doesn't crash
      setTimingData({
        best_day: "Wednesday",
        prime_time: "12 PM - 3 PM",
        high_engagement_window: "Tuesday–Thursday Afternoon"
      });
    } finally {
      setTimingLoading(false);
    }
  };

  const handleBackToFormats = () => {
    setSelectedFormat(null);
    setTimingData(null);
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
              
              {timingMode === 'recommended' && timingData && (
                <>
                  <div className="st-rec-grid">
                    <div className="st-info-box">
                      <div className="st-info-label">Best Day</div>
                      <div className="st-info-val">{timingData.best_day}</div>
                    </div>
                    <div className="st-info-box">
                      <div className="st-info-label">Prime Time</div>
                      <div className="st-info-val">{timingData.prime_time}</div>
                    </div>
                    <div className="st-info-box full">
                      <div className="st-info-label">High Engagement Window</div>
                      <div className="st-info-val">{timingData.high_engagement_window}</div>
                    </div>
                  </div>
                  <div className="st-action">
                    <button className="st-submit">Confirm Selection</button>
                  </div>
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
                    <button className="st-submit" disabled={!customDate || !customTime}>
                      Confirm Selection
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
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
