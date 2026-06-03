import { Check } from "lucide-react";

export default function PackageCard({ pkg, onPurchase, purchasingId }) {
  const isPurchasing = purchasingId === pkg.package_id;

  // Split description by newlines or list out standard items if empty
  const descriptionItems = pkg.description
    ? pkg.description.split("\n").filter((item) => item.trim() !== "")
    : [
        `${pkg.credits} campaign credits`,
        `Validity: ${pkg.validity_days} days`,
        "Priority ad support",
        "Analytics dashboard access",
      ];

  // Map package names to gradients for premium look
  const getGradient = (name) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes("starter")) {
      return "linear-gradient(135deg, #0ea5e9, #2563eb)";
    }
    if (lowercase.includes("growth")) {
      return "linear-gradient(135deg, #8b5cf6, #d946ef)";
    }
    if (lowercase.includes("scale")) {
      return "linear-gradient(135deg, #f43f5e, #ec4899)";
    }
    return "linear-gradient(135deg, #10b981, #059669)";
  };

  const borderGlow = (name) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes("starter")) return "rgba(14,165,233,0.3)";
    if (lowercase.includes("growth")) return "rgba(139,92,246,0.3)";
    if (lowercase.includes("scale")) return "rgba(244,63,94,0.3)";
    return "rgba(16,185,129,0.3)";
  };

  return (
    <>
      <style>{`
        .pc-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
          backdrop-filter: blur(16px);
        }
        .pc-card:hover {
          transform: translateY(-6px);
          border-color: var(--glow-color);
          box-shadow: 0 12px 30px var(--glow-color-shadow);
        }

        .pc-badge {
          position: absolute; top: 18px; right: -26px;
          transform: rotate(45deg);
          width: 100px; text-align: center;
          background: var(--gradient);
          color: #fff; font-size: 10px; font-weight: 700;
          padding: 4px 0; text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .pc-title {
          font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.95);
          margin-bottom: 6px;
        }

        .pc-price-row {
          display: flex; align-items: baseline; gap: 4px;
          margin-top: 12px; margin-bottom: 20px;
        }
        .pc-price-symbol { font-size: 18px; font-weight: 600; color: #fff; }
        .pc-price { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
        .pc-price-term { font-size: 12px; color: rgba(255,255,255,0.4); margin-left: 4px; }

        .pc-credits-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 10px 14px;
          margin-bottom: 20px;
        }
        .pc-credits-num { font-size: 20px; font-weight: 800; color: #fff; }
        .pc-credits-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 600; }

        .pc-divider { height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 24px; }

        .pc-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; flex: 1; }
        .pc-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.75); }
        .pc-icon { color: #38bdf8; flex-shrink: 0; margin-top: 2px; }

        .pc-btn {
          width: 100%; height: 42px; border-radius: 14px; border: none;
          background: var(--gradient);
          color: white; font-weight: 700; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; font-family: 'Inter', sans-serif; font-size: 13px;
        }
        .pc-btn:hover:not(:disabled) { opacity: 0.95; transform: scale(0.98); }
        .pc-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        @keyframes pc-spin { to { transform: rotate(360deg); } }
        .pc-loading-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: pc-spin 0.6s linear infinite;
        }
      `}</style>

      <div
        className="pc-card"
        style={{
          "--glow-color": borderGlow(pkg.package_name),
          "--glow-color-shadow": borderGlow(pkg.package_name).replace("0.3", "0.1"),
        }}
      >
       {pkg.credits >= 700 ? (
  <div
    className="pc-badge"
    style={{ "--gradient": getGradient(pkg.package_name) }}
  >
     best value
  </div>
) : pkg.credits >= 300 ? (
  <div
    className="pc-badge"
    style={{ "--gradient": getGradient(pkg.package_name) }}
  >
     Popular
  </div>
) : null}

        <div className="pc-title">{pkg.package_name}</div>
        
        <div className="pc-price-row">
          <span className="pc-price-symbol">₹</span>
          <span className="pc-price">{parseFloat(pkg.price).toLocaleString("en-IN")}</span>
          <span className="pc-price-term">/ pack</span>
        </div>

        <div className="pc-credits-box">
          <div className="pc-credits-num">{pkg.credits}</div>
          <div className="pc-credits-label">Campaign Credits</div>
        </div>

        <div className="pc-divider" />

        <ul className="pc-list">
          {descriptionItems.map((item, idx) => (
            <li key={idx} className="pc-item">
              <Check size={15} className="pc-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="pc-btn"
          style={{ "--gradient": getGradient(pkg.package_name) }}
          disabled={isPurchasing || purchasingId !== null}
          onClick={() => onPurchase(pkg)}
        >
          {isPurchasing ? (
            <span className="pc-loading-spinner" />
          ) : (
            `Get ${pkg.package_name}`
          )}
        </button>
      </div>
    </>
  );
}
