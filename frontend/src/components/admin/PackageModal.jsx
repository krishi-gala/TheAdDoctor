import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./PackageModal.css";

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
            <div className="pkg-modal-body">
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

              <div className="pkg-field">
                <div className="pkg-toggle-row">
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
    
  );
}