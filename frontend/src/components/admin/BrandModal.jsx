import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchPackageOptions } from "../../services/packages";
import { isValidPassword, PASSWORD_REQUIREMENT_TEXT } from "../../constants/password";
import "./BrandModal.css";

const BUSINESS_TYPES = [
    "Retail",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Technology",
  "Food & Beverage",
  "Travel & Hospitality",
  "Beauty & Fashion",
  "Fitness & Wellness",
  "Real Estate",
  "Entertainment & Media",
  "Local Business",
  "Professional Services",
  "Automobile",
  "Home Decor & Furniture",
  "Jewelry & Luxury",
  "Non-Profit",
  "Other",
];

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
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  const fetchPackages = async () => {
    setPackagesLoading(true);

    try {
      const response = await fetchPackageOptions({ status: "active", page_size: 100 });
      setPackages(response.data?.packages || []);
    } catch (err) {
      console.error("Failed to fetch package options", err);
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    fetchPackages();

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
    } else if (form.password && !isValidPassword(form.password)) {
      next.password = `Password must be ${PASSWORD_REQUIREMENT_TEXT.toLowerCase()}.`;
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
      is_active: form.is_active,
    };

    const packageChanged = mode === "add" || form.package !== (brand?.package || "");
    if (packageChanged && form.package && form.package !== "Expired") {
      payload.package = form.package;
    }

    if (form.password) {
      payload.password = form.password;
    }

    onSave(payload);
  };

  return (
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
            <div className="bm-modal-body">
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
                placeholder={mode === "edit" ? "••••••••" : PASSWORD_REQUIREMENT_TEXT}
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
                  <option value="" disabled={packagesLoading}>
                    {packagesLoading ? "Loading packages..." : "Select package"}
                  </option>
                  {form.package && !packages.some((pkg) => pkg.package_name === form.package) && (
                    <option value={form.package}>{form.package}</option>
                  )}
                  {packages.map((pkg) => (
                    <option key={pkg.package_id} value={pkg.package_name}>
                      {pkg.package_name}
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
    
  );
}
