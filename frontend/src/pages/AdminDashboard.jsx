import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import StatsCards from "../components/admin/Statscards";
import BrandTable from "../components/admin/BrandTable";

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        total_brands: 0,
    });

    const fetchDashboard = async () => {
        try {
            const response = await API.get("/admin/dashboard");
            setDashboardData(response.data);
        } catch (error) {
            console.log(error.response?.data);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        .dash-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #2d1f6e;
          display: flex;
          overflow: hidden;
          position: relative;
          color: #fff;
        }

        .dash-orb1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: #7c3aed; top: -200px; left: -150px;
          opacity: 0.45; filter: blur(110px); pointer-events: none; z-index: 0;
        }
        .dash-orb2 {
          position: fixed; width: 400px; height: 400px; border-radius: 50%;
          background: #0ea5e9; bottom: -100px; left: 200px;
          opacity: 0.18; filter: blur(110px); pointer-events: none; z-index: 0;
        }
        .dash-orb3 {
          position: fixed; width: 300px; height: 300px; border-radius: 50%;
          background: #4f46e5; top: 40%; right: -80px;
          opacity: 0.3; filter: blur(90px); pointer-events: none; z-index: 0;
        }

        .dash-main {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
          position: relative;
          z-index: 2;
          min-width: 0;
        }
      `}</style>

            <div className="dash-root">
                <div className="dash-orb1" />
                <div className="dash-orb2" />
                <div className="dash-orb3" />

                <Sidebar />

                <main className="dash-main">
                    <Topbar />
                    <div style={{ marginTop: 32 }}>
                        <StatsCards dashboardData={dashboardData} />
                        <div style={{ marginTop: 40 }}>
                            <BrandTable onBrandsChange={fetchDashboard} />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}