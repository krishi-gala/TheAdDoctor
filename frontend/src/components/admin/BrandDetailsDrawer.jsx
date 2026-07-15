import { useEffect, useState } from "react";
import {
  X,
  Wallet,
  Package,
  Megaphone,
  Loader2,
  CalendarClock,
  AlertTriangle,
  History,
  Activity,
} from "lucide-react";
import { fetchBrandById, fetchBrandHistory } from "../../services/brands";
import "./BrandDetailsDrawer.css";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function DetailRow({ label, value }) {
  return (
    <div className="bd-row">
      <span className="bd-label">{label}</span>
      <span className="bd-value">{value ?? "—"}</span>
    </div>
  );
}

export default function BrandDetailsDrawer({ open, brandId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !brandId) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      setDetail(null);
      try {
        const [res, histRes] = await Promise.all([
          fetchBrandById(brandId),
          fetchBrandHistory(brandId)
        ]);
        if (!cancelled) {
          setDetail(res.data.brand);
          setHistory(histRes.data.history || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Failed to load brand details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, brandId]);

  if (!open) return null;

  return (
    <>
      <div className="bd-overlay" onClick={onClose} />
      <aside className="bd-drawer">
        <div className="bd-head">
          <div>
            <div className="bd-title">Brand details</div>
            <div className="bd-sub">
              {detail?.company_name || "Loading..."}
            </div>
          </div>
          <button type="button" className="bd-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="bd-body">
          {loading ? (
            <div className="bd-loading">
              <Loader2 size={28} className="bd-loader-icon" />
              Loading details...
            </div>
          ) : error ? (
            <div className="bd-error">{error}</div>
          ) : detail ? (
            <>
              <div className="bd-section">Account</div>
              <DetailRow label="Company" value={detail.company_name} />
              <DetailRow label="Email" value={detail.email} />
              <DetailRow label="Phone" value={detail.phone_number} />
              <DetailRow label="Business type" value={detail.business_type} />
              <DetailRow label="Package" value={detail.package} />

              {/* Package expiry row */}
              {(() => {
                if (!detail.package_expiry) return null;
                const expiry = new Date(detail.package_expiry);
                const now = new Date();
                const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                const expired = detail.is_package_expired;
                const expiringSoon = !expired && diffDays <= 7;
                return (
                  <div className="bd-row">
                    <span className="bd-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CalendarClock size={13} />
                        Package Expiry
                      </span>
                    </span>
                    <span className="bd-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {formatDate(detail.package_expiry)}
                      {expired && (
                        <span className="bd-expiry-badge bd-expiry-badge--expired">Expired</span>
                      )}
                      {expiringSoon && (
                        <span className="bd-expiry-badge bd-expiry-badge--soon">
                          <AlertTriangle size={11} /> {diffDays}d left
                        </span>
                      )}
                    </span>
                  </div>
                );
              })()}

              <div className="bd-row">
                <span className="bd-label">Status</span>
                <span
                  className={`bd-status ${
                    detail.is_active ? "active" : "inactive"
                  }`}
                >
                  {detail.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <DetailRow label="Created" value={formatDate(detail.created_at)} />
              <DetailRow label="Updated" value={formatDate(detail.updated_at)} />

              <div className="bd-section">Activity Summary</div>
              <div className="bd-future">
                <Wallet size={20} />
                <div>
                  <strong>Wallet balance</strong>
                  {detail.wallet_balance ?? "—"}
                </div>
              </div>
              <div className="bd-future">
                <Package size={20} />
                <div>
                  <strong>Purchased packages</strong>
                  {detail.purchased_packages?.length
                    ? detail.purchased_packages.join(", ")
                    : "None"}
                </div>
              </div>
              <div className="bd-future">
                <Megaphone size={20} />
                <div>
                  <strong>Campaign count</strong>
                  {detail.campaign_count ?? 0}
                </div>
              </div>
              <div className="bd-section">History & Audit Logs</div>
              <div className="bd-history-list">
                {history.length > 0 ? (
                  history.map((log) => (
                    <div key={log.audit_id} className={`bd-history-item severity-${log.severity}`}>
                      <div className="bd-history-dot"></div>
                      <div className="bd-history-content">
                        <div className="bd-history-desc">{log.description || log.action_type}</div>
                        <div className="bd-history-time">{formatDate(log.created_at)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bd-history-empty">No history available for this brand.</div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
