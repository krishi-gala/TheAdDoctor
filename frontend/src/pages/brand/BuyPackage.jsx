import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { fetchBrandPackages, purchasePackage } from "../../services/packages";
import PackageCard from "../../components/brand/PackageCard";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function BuyPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [toast, setToast] = useState(null);

  const { reloadWallet } = useOutletContext();
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadPackages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchBrandPackages();
      setPackages(response.data.packages || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load packages. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handlePurchaseInit = (pkg) => {
    setSelectedPkg(pkg);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    const pkgId = selectedPkg.package_id;
    const pkgName = selectedPkg.package_name;
    
    setSelectedPkg(null);
    setPurchasingId(pkgId);
    
    try {
      await purchasePackage(pkgId);
      showToast(`Successfully purchased ${pkgName}! Credits added instantly.`);
      await reloadWallet();
      
      // Navigate back to dashboard to see active wallet state
      setTimeout(() => {
        navigate("/brand/dashboard");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || "Purchase failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <>
      <style>{`
        .bp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .bp-header-block {
          text-align: center; margin-bottom: 40px; margin-top: 10px;
        }
        .bp-subtitle {
          font-size: 15px; color: rgba(255,255,255,0.45); max-width: 600px;
          margin: 12px auto 0; line-height: 1.5;
        }

        .bp-loader, .bp-error, .bp-empty {
          text-align: center; padding: 64px 24px; color: rgba(255,255,255,0.45);
        }
        .bp-error { color: #f87171; }
        .bp-retry-btn {
          margin-top: 16px; height: 42px; padding: 0 18px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: white; border-radius: 12px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-size: 14px;
        }

        .bp-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
          backdrop-filter: blur(12px);
          animation: bp-slide-in 0.25s ease;
        }
        .bp-toast.success {
          background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.35);
          color: #4ade80;
        }
        .bp-toast.error {
          background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35);
          color: #f87171;
        }
        @keyframes bp-slide-in {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div>
        <div className="bp-header-block">
          <p className="bp-subtitle">
            Scale your brand's footprint. Choose a credit package to start deploying high-converting ad campaigns.
          </p>
        </div>

        {loading ? (
          <div className="bp-loader">
            <Loader2
              size={36}
              style={{
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
                display: "block",
              }}
            />
            <span>Loading packages...</span>
          </div>
        ) : error ? (
          <div className="bp-error">
            <span>{error}</span>
            <br />
            <button type="button" className="bp-retry-btn" onClick={loadPackages}>
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="bp-empty">
            <span>No credit packages are currently available for purchase.</span>
          </div>
        ) : (
          <div className="bp-grid">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.package_id}
                pkg={pkg}
                purchasingId={purchasingId}
                onPurchase={handlePurchaseInit}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!selectedPkg}
        title="Purchase Package?"
        message={
          selectedPkg ? (
            <>
              You are about to purchase <strong>{selectedPkg.package_name}</strong> for{" "}
              <strong>₹{parseFloat(selectedPkg.price).toLocaleString("en-IN")}</strong>.<br />
              This will add <strong>{selectedPkg.credits} credits</strong> to your wallet, valid for{" "}
              <strong>{selectedPkg.validity_days} days</strong>.
            </>
          ) : null
        }
        confirmLabel="Purchase"
        onConfirm={handleConfirmPurchase}
        onCancel={() => setSelectedPkg(null)}
        loading={purchasingId !== null}
      />

      {toast && (
        <div className={`bp-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
