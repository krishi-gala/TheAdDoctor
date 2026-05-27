import { useOutletContext, Link } from "react-router-dom";
import { CreditCard, Wallet, Calendar, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";
import TransactionHistory from "../components/brand/TransactionHistory";

export default function BrandDashboard() {
  const { wallet, walletLoading } = useOutletContext();

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
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

  // Determine percentage of credits remaining
  const total = wallet?.total_credits || 0;
  const remaining = wallet?.remaining_credits || 0;
  const used = wallet?.used_credits || 0;
  const percentRemaining = total > 0 ? Math.round((remaining / total) * 100) : 0;

  return (
    <>
      <style>{`
        .bd-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .bd-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }

        .bd-card-glow {
          position: absolute; top: 0; left: 10%; right: 10%; height: 2px;
          background: linear-gradient(90deg, transparent, var(--glow-color), transparent);
        }

        .bd-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .bd-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: var(--icon-bg); color: var(--icon-color);
        }

        .bd-label { font-size: 12.5px; color: rgba(255,255,255,0.4); font-weight: 500; margin-bottom: 6px; }
        .bd-value { font-size: 28px; font-weight: 800; color: #fff; line-height: 1.1; }
        .bd-meta { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 8px; display: flex; align-items: center; gap: 4px; }
        
        .bd-progress-bar-bg {
          height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; margin-top: 14px; overflow: hidden;
        }
        .bd-progress-bar-fill {
          height: 100%; background: linear-gradient(90deg, #38bdf8, #0284c7); border-radius: 99px;
          transition: width 0.4s ease;
        }

        .bd-alert-banner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-radius: 16px; margin-bottom: 28px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22);
          color: #f87171;
        }
        .bd-alert-banner-left { display: flex; align-items: center; gap: 12px; font-size: 14px; }
        .bd-alert-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600;
          background: #ef4444; color: #fff; text-decoration: none;
          transition: background 0.2s;
        }
        .bd-alert-cta:hover { background: #dc2626; }

        .bd-skeleton-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px;
        }
        .bd-skeleton-card {
          height: 138px; border-radius: 20px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: bd-shimmer 1.5s infinite;
        }
        @keyframes bd-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 900px) {
          .bd-grid, .bd-skeleton-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div>
        {walletLoading ? (
          <div className="bd-skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bd-skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            {(!wallet || wallet.remaining_credits === 0 || wallet.is_expired) && (
              <div className="bd-alert-banner">
                <div className="bd-alert-banner-left">
                  <AlertTriangle size={20} />
                  <span>
                    {wallet?.is_expired && wallet.active_package
                      ? `Your package "${wallet.active_package}" has expired. Purchase a new package to reactivate campaign credits.`
                      : "No active package. Purchase a package subscription to instantly acquire advertising credits."}
                  </span>
                </div>
                <Link to="/brand/buy-package" className="bd-alert-cta">
                  Buy Package
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            )}

            <div className="bd-grid">
              {/* Active Package Card */}
              <div className="bd-card" style={{ "--glow-color": "#38bdf8" }}>
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap" style={{ "--icon-bg": "rgba(56,189,248,0.12)", "--icon-color": "#38bdf8" }}>
                    <CreditCard size={20} />
                  </div>
                  {wallet?.is_expired ? (
                    <span style={{ fontSize: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", padding: "3px 8px", borderRadius: "10px", fontWeight: 600 }}>EXPIRED</span>
                  ) : wallet?.active_package ? (
                    <span style={{ fontSize: "10px", background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "3px 8px", borderRadius: "10px", fontWeight: 600 }}>ACTIVE</span>
                  ) : null}
                </div>
                <div className="bd-label">Active Package</div>
                <div className="bd-value" style={{ fontSize: wallet?.active_package ? "26px" : "28px" }}>
                  {wallet?.active_package || "No Active Plan"}
                </div>
                <div className="bd-meta">
                  <Calendar size={13} />
                  {wallet?.expiry_date ? `Expires: ${formatDate(wallet.expiry_date)}` : "No expiration set"}
                </div>
              </div>

              {/* Remaining Credits Card */}
              <div className="bd-card" style={{ "--glow-color": "#a78bfa" }}>
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap" style={{ "--icon-bg": "rgba(167,139,250,0.12)", "--icon-color": "#a78bfa" }}>
                    <Wallet size={20} />
                  </div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    {percentRemaining}% left
                  </span>
                </div>
                <div className="bd-label">Remaining Balance</div>
                <div className="bd-value">{remaining} Credits</div>
                <div className="bd-progress-bar-bg">
                  <div className="bd-progress-bar-fill" style={{ width: `${percentRemaining}%`, background: "linear-gradient(90deg, #a78bfa, #8b5cf6)" }} />
                </div>
              </div>

              {/* Usage / Total Credits Card */}
              <div className="bd-card" style={{ "--glow-color": "#34d399" }}>
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap" style={{ "--icon-bg": "rgba(52,211,153,0.12)", "--icon-color": "#34d399" }}>
                    <ShieldCheck size={20} />
                  </div>
                  <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)" }}>
                    Total: {total}
                  </span>
                </div>
                <div className="bd-label">Credits Consumed</div>
                <div className="bd-value">{used} Credits</div>
                <div className="bd-meta">
                  <span>Usage tracks active ad campaign runs</span>
                </div>
              </div>
            </div>
          </>
        )}

        <TransactionHistory />
      </div>
    </>
  );
}