import { useEffect, useState } from "react";
import {
  X,
  Wallet,
  Package,
  Megaphone,
  Loader2,
} from "lucide-react";
import { fetchBrandById } from "../../services/brands";
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
