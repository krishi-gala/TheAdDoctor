import { useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { CreditCard, Wallet, Calendar, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";
import TransactionHistory from "../components/brand/TransactionHistory";
import MyCampaigns from "../components/brand/MyCampaigns";
import "./BrandDashboard.css";

export default function BrandDashboard() {
  const { wallet, walletLoading, reloadWallet } = useOutletContext();

  useEffect(() => {
    if (reloadWallet) {
      reloadWallet();
    }
  }, [reloadWallet]);


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
  const total = wallet?.total_credits ?? 0;
  const remaining = wallet?.remaining_credits ?? 0;
  const used = wallet?.used_credits ?? 0;
  const percentRemaining = total > 0 ? Math.round((remaining / total) * 100) : 0;

  return (
    <>
      <div>
        {walletLoading ? (
          <div className="brand-dashboard-skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="brand-dashboard-skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            {(!wallet || wallet.remaining_credits === 0 || wallet.is_expired) && (
              <div className="brand-dashboard-alert-banner">
                <div className="brand-dashboard-alert-banner-left">
                  <AlertTriangle size={20} />
                  <span>
                    {wallet?.is_expired && wallet.active_package
                      ? `Your package "${wallet.active_package}" has expired. Purchase a new package to reactivate campaign credits.`
                      : "No active package. Purchase a package subscription to instantly acquire advertising credits."}
                  </span>
                </div>
                <Link to="/brand/buy-package" className="brand-dashboard-alert-cta">
                  Buy Package
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            )}

            <div className="brand-dashboard-grid">
              {/* Active Package Card */}
              <div className="brand-dashboard-card brand-dashboard-card--blue">
                <div className="brand-dashboard-card-glow" />
                <div className="brand-dashboard-card-header">
                  <div className="brand-dashboard-icon-wrap brand-dashboard-icon-wrap--blue">
                    <CreditCard size={20} />
                  </div>
                  {wallet?.is_expired ? (
                    <span className="brand-dashboard-status-badge brand-dashboard-status-badge--expired">EXPIRED</span>
                  ) : wallet?.active_package ? (
                    <span className="brand-dashboard-status-badge brand-dashboard-status-badge--active">ACTIVE</span>
                  ) : null}
                </div>
                <div className="brand-dashboard-label">Active Package</div>
                <div className="brand-dashboard-value" style={{ fontSize: wallet?.active_package ? "26px" : "28px" }}>
                  {wallet?.active_package || "No Active Plan"}
                </div>
                <div className="brand-dashboard-meta">
                  <Calendar size={13} />
                  {wallet?.expiry_date ? `Expires: ${formatDate(wallet.expiry_date)}` : "No expiration set"}
                </div>
              </div>

              {/* Remaining Credits Card */}
              <div className="brand-dashboard-card brand-dashboard-card--purple">
                <div className="brand-dashboard-card-glow" />
                <div className="brand-dashboard-card-header">
                  <div className="brand-dashboard-icon-wrap brand-dashboard-icon-wrap--purple">
                    <Wallet size={20} />
                  </div>
                  <span className="brand-dashboard-status-text">{percentRemaining}% left</span>
                </div>
                <div className="brand-dashboard-label">Remaining Balance</div>
                <div className="brand-dashboard-value">{remaining} Credits</div>
                <div className="brand-dashboard-progress-bar-bg">
                  <div className="brand-dashboard-progress-bar-fill brand-dashboard-progress-bar-fill--purple" style={{ width: `${percentRemaining}%` }} />
                </div>
              </div>

              {/* Usage / Total Credits Card */}
              <div className="brand-dashboard-card brand-dashboard-card--green">
                <div className="brand-dashboard-card-glow" />
                <div className="brand-dashboard-card-header">
                  <div className="brand-dashboard-icon-wrap brand-dashboard-icon-wrap--green">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="brand-dashboard-status-text">Total: {total}</span>
                </div>
                <div className="brand-dashboard-label">Credits Consumed</div>
                <div className="brand-dashboard-value">{used} Credits</div>
                <div className="brand-dashboard-meta">
                  <span>Usage tracks active ad campaign runs</span>
                </div>
              </div>
            </div>
          </>
        )}

        <TransactionHistory />
        <MyCampaigns />
      </div>
    </>
  );
}