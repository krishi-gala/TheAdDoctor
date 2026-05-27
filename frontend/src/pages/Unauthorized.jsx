import { useNavigate } from "react-router-dom";
import { getDefaultRoute, logout } from "../services/auth";

export default function Unauthorized() {
  const navigate = useNavigate();
  const homeRoute = getDefaultRoute();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#2d1f6e",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "64px",
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: "16px",
          color: "#f87171",
        }}
      >
        403
      </div>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>Access Denied</h1>
      <p style={{ maxWidth: "420px", color: "rgba(255,255,255,0.65)", marginBottom: "28px" }}>
        You do not have permission to view this page. Contact your administrator
        if you believe this is a mistake.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        {homeRoute !== "/unauthorized" && (
          <button
            type="button"
            onClick={() => navigate(homeRoute, { replace: true })}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to my workspace
          </button>
        )}
        <button
          type="button"
          onClick={() => logout(navigate)}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
