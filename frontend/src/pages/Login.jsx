import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useState } from "react";
import { setAuthSession, getDefaultRoute } from "../services/auth";
import "./Login.css";




export default function Login() {

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("idle");
  const [forgotError, setForgotError] = useState("");

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setForgotError("");
    setForgotStatus("loading");

    try {
      await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotStatus("success");
    } catch (err) {
      setForgotStatus("idle");
      setForgotError(err.response?.data?.detail || "Unable to send reset email");
    }
  };

  const handleLogin = async () => {
    if (status !== "idle") return;

    try {
      setError("");
      setStatus("loading");

      const response = await API.post("/login", {
        email,
        password,
      });

      const data = response.data;

      setAuthSession({
        accessToken: data.access_token,
        role: data.role,
        permissions: data.permissions || [],
      });

      setStatus("success");

      setTimeout(() => {
        navigate(getDefaultRoute(), { replace: true });
      }, 1200);

    } catch (err) {

      setStatus("idle");

      setError(
        err.response?.data?.detail ||
        "Login Failed"
      );
    }
  };

  return (

    <div className="ad-root">
      <div className="ad-orb1" />
      <div className="ad-orb2" />
      <div className="ad-orb3" />

      {/* LEFT PANEL */}
      <div className="ad-left">
        <div className="ad-logo-row">
          <div className="ad-logo-mark">❤️</div>
          <span className="ad-logo-text">The Ad Doctor</span>
        </div>

        <div className="ad-hero">
          <div className="ad-pill">
            <span className="ad-pill-dot" />
            Ad Intelligence Platform
          </div>

          <div className="ad-h1">
            Plan. Book. Approve. 
            <br />
            <span className="ad-h1-grad">Deliver.</span>
          </div>

          <p className="ad-desc">
            Track performance metrics, optimise production configurations, and
            scale cross-network spend using unified infrastructure.
          </p>

          
          <div className="ad-feature-list">

  <div className="ad-feature-card">
    <div className="ad-feature-icon">
      <i className="ti ti-speakerphone" />
    </div>

    <div className="ad-feature-content">
      <div className="ad-feature-title">
        Campaign Management
      </div>

      <div className="ad-feature-desc">
        Book, manage and track advertising campaigns from a single platform.
      </div>
    </div>
  </div>

  <div className="ad-feature-card">
    <div className="ad-feature-icon">
      <i className="ti ti-package" />
    </div>

    <div className="ad-feature-content">
      <div className="ad-feature-title">
        Credit-Based Packages
      </div>

      <div className="ad-feature-desc">
        Purchase flexible credit packages and utilize them across ad formats.
      </div>
    </div>
  </div>

  <div className="ad-feature-card">
    <div className="ad-feature-icon">
      <i className="ti ti-target-arrow" />
    </div>

    <div className="ad-feature-content">
      <div className="ad-feature-title">
        Smart Recommendations
      </div>

      <div className="ad-feature-desc">
        Receive optimized inventory and timing suggestions powered by analytics.
      </div>
    </div>
  </div>

  <div className="ad-feature-card">
    <div className="ad-feature-icon">
      <i className="ti ti-chart-bar" />
    </div>

    <div className="ad-feature-content">
      <div className="ad-feature-title">
        Operations Dashboard
      </div>

      <div className="ad-feature-desc">
        Monitor approvals, inventory allocation, package usage and reporting.
      </div>
    </div>
  </div>

</div>
        </div>

        <div className="ad-foot">© 2026 The Ad Doctor · All rights reserved</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="ad-right">
        <div className="ad-card">
          <div className="ad-card-bar" />

          <div className="ad-portal-tag">
            <i className="ti ti-building ad-portal-tag--icon" aria-hidden="true" />
            login 
          </div>

          <div className="ad-wlc">Welcome back</div>
          <div className="ad-wlc-sub">Sign in to access your workspace</div>

          {/* Email */}
          <label className="ad-lbl">Email address</label>
          <div className="ad-fw">
            <i className="ti ti-mail ad-fw-icon" aria-hidden="true" />
            <input
              className="ad-input"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* Password */}
          <label className="ad-lbl">Password</label>
          <div className="ad-fw">
            <i className="ti ti-lock ad-fw-icon" aria-hidden="true" />
            <input
              className="ad-input"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {
              error && (
                <div className="ad-error-msg">
                  {error}
                </div>
              )
            }
            <button
              className="ad-eye"
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label="Toggle password visibility"
            >
              <i
                className={`ti ${showPwd ? "ti-eye-off" : "ti-eye"}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Helpers */}
          <div className="ad-helpers">
            <button
              className="ad-remb"
              type="button"
              onClick={() => setRemember((v) => !v)}
            >
              <div className={`ad-chk${remember ? " ad-chk-on" : ""}`}>
                {remember && (
                  <i className="ti ti-check ad-chk-icon" aria-hidden="true" />
                )}
              </div>
              Remember device
            </button>
            <button
              className="ad-forgot"
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotStatus("idle");
                setForgotError("");
                setShowForgotModal(true);
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign in button */}
          <button
            className={`ad-btn-main${status === "success" ? " ad-btn-success" : ""}`}
            type="button"
            onClick={handleLogin}
            disabled={status !== "idle"}
          >
            <i
              className={`ti ${status === "loading"
                  ? "ti-loader-2 ad-spin"
                  : status === "success"
                    ? "ti-check"
                    : "ti-arrow-right"
                }`}
              aria-hidden="true"
            />
            <span>
              {status === "loading"
                ? "Authenticating..."
                : status === "success"
                  ? "Access granted"
                  : "Sign in to dashboard"}
            </span>
          </button>

          <div className="ad-divrow">
            <div className="ad-divline" />
            <div className="ad-divline" />
          </div>

          
        </div>
      </div>

      {showForgotModal && (
        <div className="ad-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForgotModal(false);
        }}>
          <div className="ad-modal" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
            <button
              className="ad-modal-close"
              type="button"
              aria-label="Close forgot password dialog"
              onClick={() => setShowForgotModal(false)}
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
            <div className="ad-portal-tag">Password recovery</div>
            <div className="ad-wlc" id="forgot-password-title">Forgot your password?</div>
            <div className="ad-wlc-sub">Enter your registered email and we will send a secure reset link.</div>

            {forgotStatus === "success" ? (
              <div className="ad-forgot-success">
                If an account exists for this email, a reset link has been sent.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <label className="ad-lbl" htmlFor="forgot-email">Email address</label>
                <div className="ad-fw">
                  <i className="ti ti-mail ad-fw-icon" aria-hidden="true" />
                  <input
                    id="forgot-email"
                    className="ad-input"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                  />
                </div>
                {forgotError && <div className="ad-error-msg">{forgotError}</div>}
                <button className="ad-btn-main ad-modal-submit" type="submit" disabled={forgotStatus === "loading"}>
                  <i className={`ti ${forgotStatus === "loading" ? "ti-loader-2 ad-spin" : "ti-send"}`} aria-hidden="true" />
                  {forgotStatus === "loading" ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}