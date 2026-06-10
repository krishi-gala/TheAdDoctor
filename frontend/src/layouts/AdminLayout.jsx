import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="dash-root">
      <div className="dash-orb1" />
      <div className="dash-orb2" />
      <div className="dash-orb3" />

      <Sidebar />

      <main className="dash-main">
        <Topbar />
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
