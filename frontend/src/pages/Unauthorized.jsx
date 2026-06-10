import { useNavigate } from "react-router-dom";
import { getDefaultRoute, logout } from "../services/auth";
import "./Unauthorized.css";

export default function Unauthorized() {
  const navigate = useNavigate();
  const homeRoute = getDefaultRoute();

  return (
    <div className="unauth-container">
      <div className="unauth-code">403</div>
      <h1 className="unauth-title">Access Denied</h1>
      <p className="unauth-message">
        You do not have permission to view this page. Contact your administrator
        if you believe this is a mistake.
      </p>
      <div className="unauth-actions">
        {homeRoute !== "/unauthorized" && (
          <button
            type="button"
            onClick={() => navigate(homeRoute, { replace: true })}
            className="unauth-btn-primary"
          >
            Go to my workspace
          </button>
        )}
        <button
          type="button"
          onClick={() => logout(navigate)}
          className="unauth-btn-secondary"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
