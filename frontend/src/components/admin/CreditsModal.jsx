import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./CreditsModal.css";

export default function CreditsModal({
  open,
  brand,
  onClose,
  onSave,
  saving,
}) {
  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setAction("add");
    setAmount("");
    setError("");
  }, [open, brand]);

  if (!open || !brand) return null;

  const currentCredits = brand.remaining_credits || 0;
  const numAmount = parseInt(amount, 10);
  
  let newCredits = currentCredits;
  if (!isNaN(numAmount) && numAmount > 0) {
    if (action === "add") newCredits = currentCredits + numAmount;
    if (action === "deduct") newCredits = currentCredits - numAmount;
  }

  const validate = () => {
    if (!amount) {
      setError("Amount is required");
      return false;
    }
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    if (action === "deduct" && val > currentCredits) {
      setError("Cannot deduct more than available credits");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(action, parseInt(amount, 10));
  };

  return (
    <div className="cr-overlay" onClick={onClose}>
        <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
          <div className="cr-head">
            <div>
              <div className="cr-title">Manage Credits</div>
              <div className="cr-sub">{brand.company_name}</div>
            </div>
            <button type="button" className="cr-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cr-current-box">
                <span className="cr-current-label">Current Credits</span>
                <span className="cr-current-val">{currentCredits}</span>
            </div>

            <div className="cr-field">
              <label className="cr-label">Action Type</label>
              <div className="cr-radio-group">
                <label className="cr-radio">
                    <input 
                        type="radio" 
                        name="action" 
                        value="add" 
                        checked={action === "add"} 
                        onChange={() => setAction("add")} 
                    />
                    Add Credits
                </label>
                <label className="cr-radio">
                    <input 
                        type="radio" 
                        name="action" 
                        value="deduct" 
                        checked={action === "deduct"} 
                        onChange={() => setAction("deduct")} 
                    />
                    Deduct Credits
                </label>
              </div>
            </div>

            <div className="cr-field">
              <label className="cr-label">Amount</label>
              <input
                className="cr-input"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
              />
            </div>

            <div className="cr-preview">
                New Balance: <strong>{newCredits}</strong>
            </div>

            {error && <p className="cr-error">{error}</p>}
            
            <div className="cr-actions">
              <button type="button" className="cr-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="cr-save" disabled={saving}>
                {saving ? "Updating..." : "Update Credits"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
