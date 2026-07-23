import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { isValidPassword, PASSWORD_REQUIREMENT_TEXT } from "../constants/password";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    API.get(`/auth/reset-password/${token}`)
      .then(() => setStatus("ready"))
      .catch(() => {
        setError("This reset link is invalid or has expired.");
        setStatus("invalid");
      });
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isValidPassword(password)) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    try {
      await API.post("/auth/reset-password", { token, new_password: password });
      setStatus("success");
      window.history.replaceState({}, document.title, "/");
      window.setTimeout(() => navigate("/", { replace: true }), 1800);
    } catch (err) {
      setStatus("ready");
      setError(err.response?.data?.detail || "Unable to reset password.");
    }
  };

  return (
    <div className="reset-root">
      <div className="reset-card">
        <div className="ad-card-bar" />
        <div className="ad-portal-tag">Password recovery</div>
        <h1>Set a new password</h1>
        <p className="reset-subtitle">Choose a new password for your The Ad Doctor account.</p>

        {status === "loading" && <p className="reset-message">Checking your reset link...</p>}
        {status === "invalid" && <p className="reset-error">{error}</p>}
        {status === "success" && <p className="reset-success">Password reset successfully. Returning you to login...</p>}

        {status === "ready" || status === "submitting" ? (
          <form onSubmit={handleSubmit}>
            <label className="ad-lbl" htmlFor="new-password">New password</label>
            <input id="new-password" className="reset-input" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <label className="ad-lbl" htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" className="reset-input" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <p className="reset-requirements">{PASSWORD_REQUIREMENT_TEXT}</p>
            {error && <p className="reset-error">{error}</p>}
            <button className="ad-btn-main" type="submit" disabled={status === "submitting"}>
              <i className={`ti ${status === "submitting" ? "ti-loader-2 ad-spin" : "ti-check"}`} aria-hidden="true" />
              {status === "submitting" ? "Resetting..." : "Reset password"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}