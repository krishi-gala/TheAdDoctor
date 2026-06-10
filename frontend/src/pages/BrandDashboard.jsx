import { useOutletContext, Link } from "react-router-dom";
import { CreditCard, Wallet, Calendar, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";
import TransactionHistory from "../components/brand/TransactionHistory";
import "./BrandDashboard.css";

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
              <div className="bd-card bd-card--blue">
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap bd-icon-wrap--blue">
                    <CreditCard size={20} />
                  </div>
                  {wallet?.is_expired ? (
                    <span className="bd-status-badge bd-status-badge--expired">EXPIRED</span>
                  ) : wallet?.active_package ? (
                    <span className="bd-status-badge bd-status-badge--active">ACTIVE</span>
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
              <div className="bd-card bd-card--purple">
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap bd-icon-wrap--purple">
                    <Wallet size={20} />
                  </div>
                  <span className="bd-status-text">{percentRemaining}% left</span>
                </div>
                <div className="bd-label">Remaining Balance</div>
                <div className="bd-value">{remaining} Credits</div>
                <div className="bd-progress-bar-bg">
                  <div className="bd-progress-bar-fill bd-progress-bar-fill--purple" style={{ width: `${percentRemaining}%` }} />
                </div>
              </div>

              {/* Usage / Total Credits Card */}
              <div className="bd-card bd-card--green">
                <div className="bd-card-glow" />
                <div className="bd-card-header">
                  <div className="bd-icon-wrap bd-icon-wrap--green">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="bd-status-text">Total: {total}</span>
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