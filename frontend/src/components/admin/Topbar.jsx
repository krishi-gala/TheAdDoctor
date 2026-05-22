import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <>
      <style>{`
        .tb-root {
          display: flex; justify-content: space-between; align-items: center;
          position: relative; z-index: 2;
        }

        .tb-left {}
        .tb-greeting {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(45,212,191,0.12);
          border: 1px solid rgba(45,212,191,0.25);
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: #5eead4; margin-bottom: 8px;
        }
        .tb-greeting-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #5eead4;
        }
        .tb-title {
          font-size: 28px; font-weight: 800; color: #fff; line-height: 1.1;
        }
        .tb-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }

        .tb-right { display: flex; align-items: center; gap: 12px; }

        .tb-search {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 9px 14px;
          color: rgba(255,255,255,0.35); font-size: 13px;
          font-family: 'Inter', sans-serif;
          backdrop-filter: blur(12px);
        }
        .tb-search input {
          background: none; border: none; outline: none;
          color: #fff; font-family: 'Inter', sans-serif; font-size: 13px;
          width: 160px;
        }
        .tb-search input::placeholder { color: rgba(255,255,255,0.28); }

        .tb-bell {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: background 0.15s; position: relative;
          backdrop-filter: blur(12px);
        }
        .tb-bell:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tb-bell-dot {
          position: absolute; top: 8px; right: 8px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #a78bfa; border: 2px solid #2d1f6e;
        }

        .tb-avatar {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 7px 14px 7px 8px;
          cursor: pointer; transition: background 0.15s;
          backdrop-filter: blur(12px);
        }
        .tb-avatar:hover { background: rgba(255,255,255,0.1); }
        .tb-avatar-circle {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .tb-avatar-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .tb-avatar-role { font-size: 10px; color: rgba(255,255,255,0.35); }
      `}</style>

      <div className="tb-root">
        <div className="tb-left">
          <div className="tb-greeting">
            <span className="tb-greeting-dot" />
            Live Dashboard
          </div>
          <div className="tb-title">Dashboard</div>
          <div className="tb-sub">Welcome back, Admin — here's what's happening today.</div>
        </div>

        <div className="tb-right">
          <div className="tb-search">
            <Search size={14} />
            <input placeholder="Search campaigns, brands…" />
          </div>

          <div className="tb-bell">
            <Bell size={16} />
            <span className="tb-bell-dot" />
          </div>

          <div className="tb-avatar">
            <div className="tb-avatar-circle">Ad</div>
            <div>
              <div className="tb-avatar-name">Admin</div>
              <div className="tb-avatar-role">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}