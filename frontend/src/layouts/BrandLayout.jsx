import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BrandSidebar from "../components/brand/BrandSidebar";
import BrandTopbar from "../components/brand/BrandTopbar";
import { fetchBrandWallet } from "../services/packages";
import "./BrandLayout.css";

export default function BrandLayout() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadWallet = useCallback(async () => {
    try {
      const response = await fetchBrandWallet();
      setWallet(response.data);
    } catch (err) {
      console.error("Failed to load wallet in layout:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("buy-package")) return "Pricing Packages";
    if (path.includes("transactions")) return "Purchase History";
    return "Workspace Dashboard";
  };

  return (
    <div className="bl-root">
      <div className="bl-orb1" />
      <div className="bl-orb2" />
      <div className="bl-orb3" />

      <BrandSidebar />

      <main className="bl-main">
        <BrandTopbar pageTitle={getPageTitle()} walletState={wallet} />
        <div className="bl-content">
          <Outlet context={{ wallet, reloadWallet: loadWallet, walletLoading: loading }} />
        </div>
      </main>
    </div>
  );
}
