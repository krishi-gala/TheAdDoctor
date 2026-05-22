import { useEffect, useState } from "react";
import { X } from "lucide-react";

const BUSINESS_TYPES = [
  "Retail",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Technology",
  "Other",
];

const PACKAGES = ["Starter", "Growth", "Pro", "Enterprise"];

const EMPTY_FORM = {
  company_name: "",
  email: "",
  password: "",
  phone_number: "",
  business_type: "",
  package: "",
  is_active: true,
};

export default function BrandModal({ open, mode, brand, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && brand) {
      setForm({
        company_name: brand.company_name || "",
        email: brand.email || "",
        password: "",
        phone_number: brand.phone_number || "",
        business_type: brand.business_type || "",
        package: brand.package || "",
        is_active: brand.is_active ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [open, mode, brand]);

  if (!open) return null;

  const validate = () => {
    const next = {};

    if (!form.company_name.trim()) {
      next.company_name = "Company name is required";
    } else if (form.company_name.trim().length < 2) {
      next.company_name = "Company name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (mode === "add" && !form.password) {
      next.password = "Password is required";
    } else if (form.password && form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    if (form.phone_number && !/^[\d\s+\-()]{7,20}$/.test(form.phone_number)) {
      next.phone_number = "Enter a valid phone number";
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
      company_name: form.company_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim() || null,
      business_type: form.business_type || null,
      package: form.package || null,
      is_active: form.is_active,
    };

    if (form.password) {
      payload.password = form.password;
    }

    onSave(payload);
  };

  return (
    <>
      <style>{`
        .bm-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(15, 10, 40, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .bm-modal {
          width: 100%; max-width: 520px;
          background: rgba(30, 20, 70, 0.92);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          backdrop-filter: blur(24px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.45);
          overflow: hidden;
        }
        .bm-modal-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 28px 0;
        }
        .bm-modal-title {
          font-size: 20px; font-weight: 700; color: #fff;
        }
        .bm-modal-sub {
          font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px;
        }
        .bm-close {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .bm-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .bm-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
        .bm-field { display: flex; flex-direction: column; gap: 6px; }
        .bm-label {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .bm-input, .bm-select {
          height: 44px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: #fff; padding: 0 14px;
          font-family: 'Inter', sans-serif; font-size: 14px; outline: none;
        }
        .bm-input:focus, .bm-select:focus {
          border-color: rgba(167,139,250,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .bm-select option { background: #1e1550; color: #fff; }
        .bm-error { font-size: 12px; color: #f87171; }
        .bm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .bm-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .bm-toggle-label { font-size: 14px; color: rgba(255,255,255,0.85); }
        .bm-toggle {
          width: 44px; height: 24px; border-radius: 999px;
          background: rgba(255,255,255,0.15); border: none; cursor: pointer;
          position: relative; transition: background 0.2s;
        }
        .bm-toggle.on { background: #7c3aed; }
        .bm-toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
        }
        .bm-toggle.on .bm-toggle-knob { transform: translateX(20px); }
        .bm-actions {
          display: flex; gap: 12px; margin-top: 8px;
        }
        .bm-btn-cancel {
          flex: 1; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .bm-btn-save {
          flex: 1; height: 44px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .bm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bm-modal-head">
            <div>
              <div className="bm-modal-title">
                {mode === "edit" ? "Edit Brand" : "Add Brand"}
              </div>
              <div className="bm-modal-sub">
                {mode === "edit"
                  ? "Update brand account details"
                  : "Create a new brand account"}
              </div>
            </div>
            <button type="button" className="bm-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form className="bm-form" onSubmit={handleSubmit}>
            <div className="bm-field">
              <label className="bm-label">Company name</label>
              <input
                className="bm-input"
                value={form.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                placeholder="Acme Corp"
              />
              {errors.company_name && (
                <span className="bm-error">{errors.company_name}</span>
              )}
            </div>

            <div className="bm-field">
              <label className="bm-label">Email</label>
              <input
                className="bm-input"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="brand@company.com"
              />
              {errors.email && <span className="bm-error">{errors.email}</span>}
            </div>

            <div className="bm-field">
              <label className="bm-label">
                Password {mode === "edit" && "(leave blank to keep)"}
              </label>
              <input
                className="bm-input"
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={mode === "edit" ? "••••••••" : "Min. 6 characters"}
              />
              {errors.password && (
                <span className="bm-error">{errors.password}</span>
              )}
            </div>

            <div className="bm-field">
              <label className="bm-label">Phone number</label>
              <input
                className="bm-input"
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="+91 98765 43210"
              />
              {errors.phone_number && (
                <span className="bm-error">{errors.phone_number}</span>
              )}
            </div>

            <div className="bm-row">
              <div className="bm-field">
                <label className="bm-label">Business type</label>
                <select
                  className="bm-select"
                  value={form.business_type}
                  onChange={(e) => handleChange("business_type", e.target.value)}
                >
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bm-field">
                <label className="bm-label">Package</label>
                <select
                  className="bm-select"
                  value={form.package}
                  onChange={(e) => handleChange("package", e.target.value)}
                >
                  <option value="">Select package</option>
                  {PACKAGES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bm-toggle-row">
              <span className="bm-toggle-label">Active status</span>
              <button
                type="button"
                className={`bm-toggle${form.is_active ? " on" : ""}`}
                onClick={() => handleChange("is_active", !form.is_active)}
              >
                <span className="bm-toggle-knob" />
              </button>
            </div>

            <div className="bm-actions">
              <button type="button" className="bm-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="bm-btn-save" disabled={saving}>
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Create brand"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
