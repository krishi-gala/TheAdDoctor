import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BrandSidebar from "../components/brand/BrandSidebar";
import BrandTopbar from "../components/brand/BrandTopbar";
import { fetchBrandWallet } from "../services/packages";

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .bl-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .bl-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #090e1a;
          display: flex;
          overflow: hidden;
          position: relative;
          color: #fff;
        }

        .bl-orb1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: #1e3a8a; top: -200px; left: -150px;
          opacity: 0.35; filter: blur(120px); pointer-events: none; z-index: 0;
        }
        .bl-orb2 {
          position: fixed; width: 400px; height: 400px; border-radius: 50%;
          background: #0ea5e9; bottom: -100px; left: 200px;
          opacity: 0.15; filter: blur(110px); pointer-events: none; z-index: 0;
        }
        .bl-orb3 {
          position: fixed; width: 300px; height: 300px; border-radius: 50%;
          background: #0369a1; top: 40%; right: -80px;
          opacity: 0.25; filter: blur(100px); pointer-events: none; z-index: 0;
        }

        .bl-main {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
          position: relative;
          z-index: 2;
          min-width: 0;
        }
      `}</style>

      <div className="bl-root">
        <div className="bl-orb1" />
        <div className="bl-orb2" />
        <div className="bl-orb3" />

        <BrandSidebar />

        <main className="bl-main">
          <BrandTopbar pageTitle={getPageTitle()} walletState={wallet} />
          <div style={{ marginTop: 32 }}>
            <Outlet context={{ wallet, reloadWallet: loadWallet, walletLoading: loading }} />
          </div>
        </main>
      </div>
    </>
  );
}
