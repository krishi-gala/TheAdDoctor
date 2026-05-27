import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ResetPasswordModal({
  open,
  brand,
  onClose,
  onSave,
  saving,
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setConfirm("");
    setError("");
  }, [open, brand]);

  if (!open || !brand) return null;

  const validate = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(password);
  };

  return (
    <>
      <style>{`
        .rp-overlay {
          position: fixed; inset: 0; z-index: 105;
          background: rgba(15, 10, 40, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .rp-modal {
          width: 100%; max-width: 440px;
          background: rgba(30, 20, 70, 0.92);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 24px 28px 28px;
        }
        .rp-head { display: flex; justify-content: space-between; align-items: flex-start; }
        .rp-title { font-size: 20px; font-weight: 700; color: #fff; }
        .rp-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .rp-close {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-field { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
        .rp-label {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .rp-input {
          height: 44px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px; font-family: 'Inter', sans-serif; outline: none;
        }
        .rp-error { font-size: 12px; color: #f87171; margin-top: 4px; }
        .rp-actions { display: flex; gap: 12px; margin-top: 24px; }
        .rp-cancel, .rp-save {
          flex: 1; height: 44px; border-radius: 12px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .rp-cancel {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }
        .rp-save {
          border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
        }
        .rp-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="rp-overlay" onClick={onClose}>
        <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rp-head">
            <div>
              <div className="rp-title">Reset password</div>
              <div className="rp-sub">{brand.company_name}</div>
            </div>
            <button type="button" className="rp-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rp-field">
              <label className="rp-label">New password</label>
              <input
                className="rp-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="rp-field">
              <label className="rp-label">Confirm password</label>
              <input
                className="rp-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && <p className="rp-error">{error}</p>}
            <div className="rp-actions">
              <button type="button" className="rp-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="rp-save" disabled={saving}>
                {saving ? "Resetting..." : "Reset password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
