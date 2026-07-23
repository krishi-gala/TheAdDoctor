import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isValidPassword, PASSWORD_REQUIREMENT_TEXT } from "../../constants/password";
import "./ResetPasswordModal.css";

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
    if (!isValidPassword(password)) {
      setError(`Password must be ${PASSWORD_REQUIREMENT_TEXT.toLowerCase()}.`);
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
                placeholder={PASSWORD_REQUIREMENT_TEXT}
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
  );
}
