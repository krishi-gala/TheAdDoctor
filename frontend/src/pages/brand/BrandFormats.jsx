import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, Star, Calendar, Clock, ChevronLeft } from "lucide-react";
import { fetchBrandAdFormats } from "../../services/adFormats";
import { fetchSmartTimingRecommendation } from "../../services/smartTiming";

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
        <style>{`
          .st-header { margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
          .st-back-btn { 
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
            color: #fff; width: 40px; height: 40px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
          }
          .st-back-btn:hover { background: rgba(255,255,255,0.15); }
          .st-title { font-size: 24px; font-weight: 700; color: #fff; }
          .st-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 4px; }
          
          .st-card {
            background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); max-width: 600px;
          }
          
          .st-toggle-group {
            display: flex; gap: 12px; margin-bottom: 24px;
            background: rgba(0,0,0,0.2); padding: 4px; border-radius: 12px;
          }
          .st-toggle-btn {
            flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px;
            cursor: pointer; transition: 0.3s; color: rgba(255,255,255,0.5); background: transparent;
          }
          .st-toggle-btn.active { background: rgba(255,255,255,0.1); color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          
          .st-rec-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
          }
          .st-info-box {
            background: rgba(14, 165, 233, 0.05); border: 1px solid rgba(14, 165, 233, 0.2);
            border-radius: 12px; padding: 16px;
          }
          .st-info-label { font-size: 12px; color: #38bdf8; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; }
          .st-info-val { font-size: 16px; font-weight: 600; color: #fff; }
          
          .st-info-box.full { grid-column: 1 / -1; background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); }
          .st-info-box.full .st-info-label { color: #34d399; }
          
          .st-form-group { margin-bottom: 16px; }
          .st-label { display: block; font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
          .st-input {
            width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
            color: #fff; padding: 12px 16px; border-radius: 8px; outline: none; font-family: inherit;
          }
          .st-input:focus { border-color: #38bdf8; }
          
          .st-action { text-align: right; margin-top: 24px; }
          .st-submit {
            background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; border: none;
            padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
          }
          .st-submit:hover { opacity: 0.9; }
        `}</style>
        
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
            <div className="bf-loader" style={{ padding: '40px 0' }}>
              <Loader2 size={30} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <span>Analyzing best times...</span>
            </div>
          ) : (
            <>
              {timingError && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>{timingError}</div>}
              
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
                      <label className="st-label"><Calendar size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Select Date</label>
                      <input 
                        type="date" 
                        className="st-input"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                    <div className="st-form-group">
                      <label className="st-label"><Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Select Time</label>
                      <input 
                        type="time" 
                        className="st-input"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="st-action">
                    <button className="st-submit" disabled={!customDate || !customTime} style={{ opacity: (!customDate || !customTime) ? 0.5 : 1 }}>
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
      <style>{`
        .bf-header-block { margin-bottom: 32px; }
        .bf-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .bf-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); }

        .bf-loader { text-align: center; padding: 64px 24px; color: rgba(255,255,255,0.45); }

        .bf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .bf-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
          backdrop-filter: blur(16px);
        }
        .bf-card:hover:not(.bf-sold-out) {
          transform: translateY(-6px);
          border-color: rgba(14, 165, 233, 0.3);
          box-shadow: 0 12px 30px rgba(14, 165, 233, 0.1);
        }
        
        .bf-sold-out {
          opacity: 0.6;
        }

        .bf-card-title {
          font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.95);
          margin-bottom: 20px;
        }

        .bf-badge {
          position: absolute; top: 16px; right: -30px;
          transform: rotate(45deg); width: 110px; text-align: center;
          background: rgba(239, 68, 68, 0.8); color: #fff; font-size: 9px; 
          font-weight: 700; padding: 4px 0; text-transform: uppercase;
          letter-spacing: 0.05em; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .bf-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
          font-size: 13px; color: rgba(255,255,255,0.7);
        }
        .bf-icon { flex-shrink: 0; }
        .bf-icon.blue { color: #38bdf8; }
        .bf-icon.green { color: #10b981; }
        .bf-icon.gold { color: #f59e0b; }

        .bf-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0; }

        .bf-footer {
          display: flex; justify-content: space-between; align-items: center; mt: auto;
        }
        .bf-remaining {
          font-size: 12px; font-weight: 600;
        }
        .bf-remaining.avail { color: #4ade80; }
        .bf-remaining.empty { color: #f87171; }

        .bf-btn {
          height: 32px; padding: 0 16px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: white; font-weight: 600; font-size: 12px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .bf-btn:hover:not(:disabled) { opacity: 0.9; }
        .bf-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; }

      `}</style>

      <div className="bf-header-block">
        <h1 className="bf-title">Ad Formats</h1>
        <p className="bf-subtitle">
          Available advertising formats for this week.
        </p>
      </div>

      {loading ? (
        <div className="bf-loader">
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
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
