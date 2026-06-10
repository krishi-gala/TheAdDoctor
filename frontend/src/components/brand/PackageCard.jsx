import { Check } from "lucide-react";
import "./PackageCard.css";

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
