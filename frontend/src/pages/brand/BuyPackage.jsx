import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { fetchBrandPackages, purchasePackage } from "../../services/packages";
import PackageCard from "../../components/brand/PackageCard";
import ConfirmModal from "../../components/admin/ConfirmModal";
import "./BuyPackage.css";

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
      {/* Styles moved to BuyPackage.css (bpkg- prefix) */}

      <div>
        <div className="bpkg-header-block">
          <p className="bpkg-subtitle">
            Scale your brand's footprint. Choose a credit package to start deploying high-converting ad campaigns.
          </p>
        </div>

        {loading ? (
          <div className="bpkg-loader">
            <Loader2 size={36} className="bpkg-loader-icon" />
            <span>Loading packages...</span>
          </div>
        ) : error ? (
          <div className="bpkg-error">
            <span>{error}</span>
            <br />
            <button type="button" className="bpkg-retry-btn" onClick={loadPackages}>
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="bpkg-empty">
            <span>No credit packages are currently available for purchase.</span>
          </div>
        ) : (
          <div className="bpkg-grid">
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
        <div className={`bpkg-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
