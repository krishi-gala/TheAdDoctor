import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useState } from "react";



const stats = [
  {
    icon: "ti-bolt",
    value: "+240",
    label: "Campaigns Optimised",
    trend: "↑ Live",
    iconBg: "rgba(99,102,241,0.22)",
    iconColor: "#a5b4fc",
    tagBg: "rgba(99,102,241,0.18)",
    tagColor: "#a5b4fc",
    tagBorder: "rgba(99,102,241,0.3)",
  },
  {
    icon: "ti-trending-up",
    value: "89%",
    label: "Better Engagement Rate",
    trend: "↑ Avg",
    iconBg: "rgba(167,139,250,0.2)",
    iconColor: "#c4b5fd",
    tagBg: "rgba(167,139,250,0.15)",
    tagColor: "#c4b5fd",
    tagBorder: "rgba(167,139,250,0.3)",
  },
  {
    icon: "ti-currency-rupee",
    value: "₹12Cr+",
    label: "Ad Spend Managed",
    trend: "↑ YTD",
    iconBg: "rgba(45,212,191,0.15)",
    iconColor: "#5eead4",
    tagBg: "rgba(45,212,191,0.12)",
    tagColor: "#5eead4",
    tagBorder: "rgba(45,212,191,0.25)",
  },
];

export default function Login() {

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success"

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

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "role",
        data.role
      );

      setStatus("success");

      setTimeout(() => {
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/brand");
        }
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
            Smarter Campaign
            <br />
            <span className="ad-h1-grad">Decisions.</span>
          </div>

          <p className="ad-desc">
            Track performance metrics, optimise production configurations, and
            scale cross-network spend using unified infrastructure.
          </p>

          {stats.map((s) => (
            <div className="ad-stat" key={s.label}>
              <div
                className="ad-stat-ico"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                <i className={`ti ${s.icon}`} aria-hidden="true" />
              </div>
              <div>
                <div className="ad-stat-val">{s.value}</div>
                <div className="ad-stat-lbl">{s.label}</div>
              </div>
              <span
                className="ad-tag"
                style={{
                  background: s.tagBg,
                  color: s.tagColor,
                  border: `1px solid ${s.tagBorder}`,
                }}
              >
                {s.trend}
              </span>
            </div>
          ))}
        </div>

        <div className="ad-foot">© 2026 The Ad Doctor · All rights reserved</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="ad-right">
        <div className="ad-card">
          <div className="ad-card-bar" />

          <div className="ad-portal-tag">
            <i className="ti ti-building" style={{ fontSize: 11 }} aria-hidden="true" />
            Admin Panel
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
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "13px",
                    marginBottom: "14px",
                  }}
                >
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
                  <i className="ti ti-check" style={{ fontSize: 10, color: "#fff" }} aria-hidden="true" />
                )}
              </div>
              Remember device
            </button>
            <a className="ad-forgot" href="#">Forgot password?</a>
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
            <span className="ad-divtxt">or</span>
            <div className="ad-divline" />
          </div>

          <button className="ad-btn-sso" type="button">
            <i className="ti ti-building" style={{ fontSize: 15, color: "#a5b4fc" }} aria-hidden="true" />
            Continue with Enterprise SSO
          </button>

          <div className="ad-card-foot">
            Need access? <a href="#">Contact support</a>
          </div>
        </div>
      </div>
    </div>
  );
}