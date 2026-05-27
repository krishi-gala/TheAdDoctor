import { useEffect, useState } from "react";
import {
  X,
  Wallet,
  Package,
  Megaphone,
  Loader2,
} from "lucide-react";
import { fetchBrandById } from "../../services/brands";

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
        const res = await fetchBrandById(brandId);
        if (!cancelled) setDetail(res.data.brand);
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
      <style>{`
        .bd-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(15, 10, 40, 0.55);
          backdrop-filter: blur(4px);
        }
        .bd-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 101;
          width: 100%; max-width: 440px;
          background: rgba(30, 20, 70, 0.96);
          border-left: 1px solid rgba(255,255,255,0.12);
          box-shadow: -12px 0 48px rgba(0,0,0,0.35);
          display: flex; flex-direction: column;
          animation: bd-slide 0.25s ease;
        }
        @keyframes bd-slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .bd-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 28px 28px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .bd-title { font-size: 20px; font-weight: 700; color: #fff; }
        .bd-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .bd-close {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .bd-body { flex: 1; overflow-y: auto; padding: 24px 28px 32px; }
        .bd-section {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          margin: 20px 0 12px;
        }
        .bd-section:first-child { margin-top: 0; }
        .bd-row {
          display: flex; justify-content: space-between; gap: 16px;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .bd-label { font-size: 13px; color: rgba(255,255,255,0.45); }
        .bd-value {
          font-size: 14px; color: rgba(255,255,255,0.9);
          text-align: right; font-weight: 500;
        }
        .bd-status {
          padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
        }
        .bd-status.active { background: rgba(34,197,94,0.15); color: #4ade80; }
        .bd-status.inactive { background: rgba(239,68,68,0.15); color: #f87171; }
        .bd-future {
          padding: 14px; border-radius: 12px; margin-top: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px dashed rgba(255,255,255,0.12);
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.4); font-size: 13px;
        }
        .bd-future strong { color: rgba(255,255,255,0.65); display: block; }
        .bd-loading, .bd-error {
          padding: 48px 28px; text-align: center;
          color: rgba(255,255,255,0.5); font-size: 14px;
        }
        .bd-error { color: #f87171; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
              <Loader2
                size={28}
                style={{
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
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

              <div className="bd-section">Future modules</div>
              <div className="bd-future">
                <Wallet size={20} />
                <div>
                  <strong>Wallet balance</strong>
                  {detail.wallet_balance ?? "Coming soon"}
                </div>
              </div>
              <div className="bd-future">
                <Package size={20} />
                <div>
                  <strong>Purchased packages</strong>
                  {(detail.purchased_packages?.length
                    ? detail.purchased_packages.join(", ")
                    : null) ?? "Coming soon"}
                </div>
              </div>
              <div className="bd-future">
                <Megaphone size={20} />
                <div>
                  <strong>Campaign count</strong>
                  {detail.campaign_count ?? 0} (placeholder)
                </div>
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
