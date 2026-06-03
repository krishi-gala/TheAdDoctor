import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, Star } from "lucide-react";
import { fetchBrandAdFormats } from "../../services/adFormats";

export default function BrandFormats() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <button className="bf-btn" disabled={format.sold_out}>
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
