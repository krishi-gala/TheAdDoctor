import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
  Loader2,
} from "lucide-react";
import BrandModal from "./BrandModal";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
} from "../../services/brands";

const PAGE_SIZE = 8;

export default function BrandTable({ onBrandsChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchBrands({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        page_size: PAGE_SIZE,
      });
      setBrands(response.data.brands);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load brands");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(loadBrands, 300);
    return () => clearTimeout(timer);
  }, [loadBrands]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedBrand(null);
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setModalMode("edit");
    setSelectedBrand(brand);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === "add") {
        await createBrand(payload);
        showToast("Brand created successfully");
        setPage(1);
      } else {
        await updateBrand(selectedBrand.user_id, payload);
        showToast("Brand updated successfully");
      }
      setModalOpen(false);
      await loadBrands();
      onBrandsChange?.();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        typeof detail === "string" ? detail : "Failed to save brand",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(deleteTarget.user_id);
      showToast("Brand deleted successfully");
      setDeleteTarget(null);
      if (brands.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadBrands();
      }
      onBrandsChange?.();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to delete brand",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (brand) => {
    try {
      await updateBrandStatus(brand.user_id, !brand.is_active);
      showToast(
        brand.is_active ? "Brand deactivated" : "Brand activated"
      );
      await loadBrands();
      onBrandsChange?.();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to update status",
        "error"
      );
    }
  };

  return (
    <>
      <style>{`
        .bm-wrap { margin-top: 34px; }
        .bm-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 22px; flex-wrap: wrap; gap: 16px;
        }
        .bm-title { font-size: 24px; font-weight: 700; color: #fff; }
        .bm-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .bm-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .bm-search { position: relative; }
        .bm-search input {
          width: 240px; height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px 0 42px; outline: none; font-family: 'Inter', sans-serif;
        }
        .bm-search input::placeholder { color: rgba(255,255,255,0.3); }
        .bm-search-icon {
          position: absolute; top: 50%; left: 14px;
          transform: translateY(-50%); color: rgba(255,255,255,0.4);
        }
        .bm-filter {
          height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px; outline: none; font-family: 'Inter', sans-serif;
          font-size: 13px; cursor: pointer;
        }
        .bm-filter option { background: #1e1550; }
        .bm-btn {
          height: 42px; padding: 0 18px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif;
        }
        .bm-table-wrap {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; overflow: hidden; backdrop-filter: blur(18px);
        }
        .bm-table { width: 100%; border-collapse: collapse; }
        .bm-table th {
          text-align: left; padding: 18px 24px; font-size: 13px;
          color: rgba(255,255,255,0.45); font-weight: 600;
        }
        .bm-table td {
          padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88); font-size: 14px;
        }
        .bm-company { font-weight: 600; color: #fff; }
        .bm-meta { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }
        .bm-status {
          padding: 6px 12px; border-radius: 999px; font-size: 12px;
          width: fit-content; font-weight: 600;
        }
        .bm-status.active { background: rgba(34,197,94,0.15); color: #4ade80; }
        .bm-status.inactive { background: rgba(239,68,68,0.15); color: #f87171; }
        .bm-actions-cell { display: flex; gap: 8px; align-items: center; }
        .bm-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .bm-icon-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .bm-icon-btn.danger:hover { background: rgba(239,68,68,0.15); color: #f87171; }
        .bm-icon-btn.toggle-on { color: #4ade80; border-color: rgba(34,197,94,0.25); }
        .bm-icon-btn.toggle-off { color: #f87171; border-color: rgba(239,68,68,0.25); }
        .bm-empty, .bm-error-msg, .bm-loading {
          padding: 48px 24px; text-align: center;
          color: rgba(255,255,255,0.45); font-size: 14px;
        }
        .bm-error-msg { color: #f87171; }
        .bm-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .bm-count { font-size: 13px; color: rgba(255,255,255,0.4); }
        .bm-pagination { display: flex; gap: 8px; align-items: center; }
        .bm-page-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .bm-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .bm-page-btn:not(:disabled):hover { background: rgba(255,255,255,0.12); color: #fff; }
        .bm-page-num { font-size: 13px; color: rgba(255,255,255,0.5); min-width: 80px; text-align: center; }
        .bm-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
          backdrop-filter: blur(12px);
          animation: bm-slide-in 0.25s ease;
        }
        .bm-toast.success {
          background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.35);
          color: #4ade80;
        }
        .bm-toast.error {
          background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35);
          color: #f87171;
        }
        @keyframes bm-slide-in {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bm-delete-overlay {
          position: fixed; inset: 0; z-index: 110;
          background: rgba(15, 10, 40, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
        }
        .bm-delete-box {
          width: 100%; max-width: 400px; padding: 28px;
          background: rgba(30, 20, 70, 0.95);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; text-align: center;
        }
        .bm-delete-title { font-size: 18px; font-weight: 700; color: #fff; }
        .bm-delete-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 12px 0 24px; }
        .bm-delete-actions { display: flex; gap: 12px; }
        .bm-delete-cancel {
          flex: 1; height: 42px; border-radius: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;
        }
        .bm-delete-confirm {
          flex: 1; height: 42px; border-radius: 12px; border: none;
          background: rgba(239,68,68,0.85); color: #fff; font-weight: 600; cursor: pointer;
        }
        .bm-delete-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="bm-wrap">
        <div className="bm-head">
          <div>
            <h2 className="bm-title">Brand Management</h2>
            <p className="bm-subtitle">
              {total} brand{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="bm-actions">
            <div className="bm-search">
              <Search size={18} className="bm-search-icon" />
              <input
                type="text"
                placeholder="Search brand..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="bm-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="button" className="bm-btn" onClick={openAddModal}>
              <Plus size={18} />
              Add Brand
            </button>
          </div>
        </div>

        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Package</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="bm-loading">
                      <Loader2
                        size={24}
                        style={{
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 8px",
                          display: "block",
                        }}
                      />
                      Loading brands...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="bm-error-msg">{error}</div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="bm-empty">
                      No brands found. Add your first brand to get started.
                    </div>
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.user_id}>
                    <td>
                      <div className="bm-company">{brand.company_name}</div>
                      {brand.business_type && (
                        <div className="bm-meta">{brand.business_type}</div>
                      )}
                    </td>
                    <td>
                      <div>{brand.email}</div>
                      {brand.phone_number && (
                        <div className="bm-meta">{brand.phone_number}</div>
                      )}
                    </td>
                    <td>{brand.package || "—"}</td>
                    <td>
                      <span
                        className={`bm-status ${
                          brand.is_active ? "active" : "inactive"
                        }`}
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {brand.created_at
                        ? new Date(brand.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="bm-actions-cell">
                        <button
                          type="button"
                          className={`bm-icon-btn ${
                            brand.is_active ? "toggle-on" : "toggle-off"
                          }`}
                          title={
                            brand.is_active ? "Deactivate" : "Activate"
                          }
                          onClick={() => handleToggleStatus(brand)}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          type="button"
                          className="bm-icon-btn"
                          title="Edit"
                          onClick={() => openEditModal(brand)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="bm-icon-btn danger"
                          title="Delete"
                          onClick={() => setDeleteTarget(brand)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && !error && brands.length > 0 && (
            <div className="bm-footer">
              <span className="bm-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="bm-pagination">
                <button
                  type="button"
                  className="bm-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="bm-page-num">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="bm-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BrandModal
        open={modalOpen}
        mode={modalMode}
        brand={selectedBrand}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      {deleteTarget && (
        <div className="bm-delete-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="bm-delete-box" onClick={(e) => e.stopPropagation()}>
            <div className="bm-delete-title">Delete brand?</div>
            <p className="bm-delete-text">
              This will soft-delete <strong>{deleteTarget.company_name}</strong>.
              The brand will no longer appear in the list.
            </p>
            <div className="bm-delete-actions">
              <button
                type="button"
                className="bm-delete-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bm-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`bm-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
