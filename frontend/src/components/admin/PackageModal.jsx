import { useEffect, useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
  package_name: "",
  price: "",
  credits: "",
  validity_days: 30,
  description: "",
  is_active: true,
};

export default function PackageModal({ open, mode, packageData, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && packageData) {
      setForm({
        package_name: packageData.package_name || "",
        price: packageData.price ? parseFloat(packageData.price) : "",
        credits: packageData.credits ?? "",
        validity_days: packageData.validity_days ?? 30,
        description: packageData.description || "",
        is_active: packageData.is_active ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [open, mode, packageData]);

  if (!open) return null;

  const validate = () => {
    const next = {};

    if (!form.package_name.trim()) {
      next.package_name = "Package name is required";
    }

    if (form.price === "" || isNaN(form.price) || parseFloat(form.price) < 0) {
      next.price = "Enter a valid non-negative price";
    }

    if (form.credits === "" || isNaN(form.credits) || parseInt(form.credits) <= 0) {
      next.credits = "Enter a positive number of credits";
    }

    if (form.validity_days === "" || isNaN(form.validity_days) || parseInt(form.validity_days) <= 0) {
      next.validity_days = "Enter validity in days (min. 1)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      package_name: form.package_name.trim(),
      price: parseFloat(form.price),
      credits: parseInt(form.credits),
      validity_days: parseInt(form.validity_days),
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    onSave(payload);
  };

  return (
    <>
      <style>{`
        .pkg-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(15, 10, 40, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .pkg-modal {
          width: 100%; max-width: 500px;
          background: rgba(30, 20, 70, 0.92);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          backdrop-filter: blur(24px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.45);
          overflow: hidden;
        }
        .pkg-modal-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 28px 0;
        }
        .pkg-modal-title {
          font-size: 20px; font-weight: 700; color: #fff;
        }
        .pkg-modal-sub {
          font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px;
        }
        .pkg-close {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .pkg-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .pkg-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
        .pkg-field { display: flex; flex-direction: column; gap: 6px; }
        .pkg-label {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .pkg-input, .pkg-textarea {
          height: 44px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: #fff; padding: 0 14px;
          font-family: 'Inter', sans-serif; font-size: 14px; outline: none;
        }
        .pkg-textarea {
          height: auto; min-height: 80px; padding: 12px 14px; resize: vertical;
        }
        .pkg-input:focus, .pkg-textarea:focus {
          border-color: rgba(167,139,250,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .pkg-error { font-size: 12px; color: #f87171; }
        .pkg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pkg-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .pkg-toggle-label { font-size: 14px; color: rgba(255,255,255,0.85); }
        .pkg-toggle {
          width: 44px; height: 24px; border-radius: 999px;
          background: rgba(255,255,255,0.15); border: none; cursor: pointer;
          position: relative; transition: background 0.2s;
        }
        .pkg-toggle.on { background: #7c3aed; }
        .pkg-toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
        }
        .pkg-toggle.on .pkg-toggle-knob { transform: translateX(20px); }
        .pkg-actions {
          display: flex; gap: 12px; margin-top: 8px;
        }
        .pkg-btn-cancel {
          flex: 1; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .pkg-btn-save {
          flex: 1; height: 44px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .pkg-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="pkg-overlay" onClick={onClose}>
        <div className="pkg-modal" onClick={(e) => e.stopPropagation()}>
          <div className="pkg-modal-head">
            <div>
              <div className="pkg-modal-title">
                {mode === "edit" ? "Edit Package" : "Create Package"}
              </div>
              <div className="pkg-modal-sub">
                {mode === "edit"
                  ? "Update configuration details for this credit package"
                  : "Add a new credit package to the platform"}
              </div>
            </div>
            <button type="button" className="pkg-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form className="pkg-form" onSubmit={handleSubmit}>
            <div className="pkg-field">
              <label className="pkg-label">Package Name</label>
              <input
                className="pkg-input"
                value={form.package_name}
                onChange={(e) => handleChange("package_name", e.target.value)}
                placeholder="e.g. Growth Pack"
              />
              {errors.package_name && (
                <span className="pkg-error">{errors.package_name}</span>
              )}
            </div>

            <div className="pkg-row">
              <div className="pkg-field">
                <label className="pkg-label">Price (INR)</label>
                <input
                  className="pkg-input"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="₹ 15000"
                />
                {errors.price && <span className="pkg-error">{errors.price}</span>}
              </div>

              <div className="pkg-field">
                <label className="pkg-label">Credits</label>
                <input
                  className="pkg-input"
                  type="number"
                  value={form.credits}
                  onChange={(e) => handleChange("credits", e.target.value)}
                  placeholder="150"
                />
                {errors.credits && (
                  <span className="pkg-error">{errors.credits}</span>
                )}
              </div>
            </div>

            <div className="pkg-row">
              <div className="pkg-field">
                <label className="pkg-label">Validity (Days)</label>
                <input
                  className="pkg-input"
                  type="number"
                  value={form.validity_days}
                  onChange={(e) => handleChange("validity_days", e.target.value)}
                  placeholder="30"
                />
                {errors.validity_days && (
                  <span className="pkg-error">{errors.validity_days}</span>
                )}
              </div>

              <div className="pkg-field" style={{ justifyContent: "center" }}>
                <div className="pkg-toggle-row" style={{ marginTop: 20 }}>
                  <span className="pkg-toggle-label">Active</span>
                  <button
                    type="button"
                    className={`pkg-toggle${form.is_active ? " on" : ""}`}
                    onClick={() => handleChange("is_active", !form.is_active)}
                  >
                    <span className="pkg-toggle-knob" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pkg-field">
              <label className="pkg-label">Description</label>
              <textarea
                className="pkg-textarea"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Include features or benefits for this pricing tier..."
              />
            </div>

            <div className="pkg-actions">
              <button type="button" className="pkg-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="pkg-btn-save" disabled={saving}>
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Create Package"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
