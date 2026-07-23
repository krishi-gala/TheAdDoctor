import { useState, useEffect } from "react";
import { Lock, AlertTriangle } from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import { getRole, changePassword } from "../../services/auth";
import { fetchBrandAdFormats } from "../../services/adFormats";
import { isValidPassword, PASSWORD_REQUIREMENT_TEXT } from "../../constants/password";
import "./BrandTopbar.css";

const LOW_INVENTORY_THRESHOLD = 2;

export default function BrandTopbar({ pageTitle = "Dashboard", walletState }) {
  const roleName = getRole() === "brand" ? "Brand Partner" : "Client";

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [hasLowInventory, setHasLowInventory] = useState(false);
  const [lowInventoryFormat, setLowInventoryFormat] = useState(null);

  useEffect(() => {
    // Only check inventory if brand has an active package with credits
    if (!walletState || walletState.is_expired || !walletState.remaining_credits) return;

    fetchBrandAdFormats()
      .then((res) => {
        const formats = res.data || [];
        const low = formats.find(
          (f) => !f.sold_out && f.remaining_inventory > 0 && f.remaining_inventory <= LOW_INVENTORY_THRESHOLD
        );
        if (low) {
          setHasLowInventory(true);
          setLowInventoryFormat(low);
        } else {
          setHasLowInventory(false);
          setLowInventoryFormat(null);
        }
      })
      .catch(() => {
        setHasLowInventory(false);
      });
  }, [walletState]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError(`Password must be ${PASSWORD_REQUIREMENT_TEXT.toLowerCase()}.`);
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.detail || "Failed to change password. Check your current password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <div className="btb-root">
          <div className="btb-left">
            <div className="btb-greeting">
              <span className="btb-greeting-dot" />
              Ad Workspace
            </div>
            <div className="btb-title">{pageTitle}</div>
            <div className="btb-sub">Manage your advertising campaigns and credits.</div>
          </div>

        <div className="btb-right">
          <button 
            className="btb-change-pwd-btn"
            onClick={() => {
              setPasswordError("");
              setPasswordSuccess("");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setShowPasswordModal(true);
            }}
          >
            <Lock size={16} /> Change Password
          </button>

          {walletState && walletState.remaining_credits !== undefined && (
            <div className="btb-credits-badge">
              <span className="btb-credits-label">Balance</span>
              <span className="btb-credits-val">{walletState.remaining_credits} Credits</span>
            </div>
          )}

          <NotificationBell />

          <div className="btb-avatar">
            <div className="btb-avatar-circle">Br</div>
            <div>
              <div className="btb-avatar-name">Brand User</div>
              <div className="btb-avatar-role">{roleName}</div>
            </div>
          </div>
        </div>
      </div>

      {hasLowInventory && lowInventoryFormat && (
        <div className="btb-urgency-banner">
          <AlertTriangle size={16} className="btb-urgency-icon" />
          <span>
            <strong>Low Inventory Alert:</strong> Only{" "}
            <strong>{lowInventoryFormat.remaining_inventory} slot{lowInventoryFormat.remaining_inventory === 1 ? "" : "s"}</strong>{" "}
            left for <strong>{lowInventoryFormat.name}</strong> this week. Book now before it sells out!
          </span>
        </div>
      )}

      {showPasswordModal && (
        <div className="pwd-modal-overlay">
          <div className="pwd-modal">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="pwd-modal-form-group">
                <label>Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="pwd-modal-form-group">
                <label>New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span className="pwd-modal-help">{PASSWORD_REQUIREMENT_TEXT}</span>
              </div>
              <div className="pwd-modal-form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordError && (
                <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "10px" }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ color: "#10b981", fontSize: "13px", marginTop: "10px" }}>
                  {passwordSuccess}
                </div>
              )}

              <div className="pwd-modal-actions">
                <button 
                  type="button" 
                  className="pwd-modal-btn cancel"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="pwd-modal-btn submit"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Saving..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
