import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Eye,
  KeyRound,
  MoreHorizontal,
  Loader2,
  RotateCcw,
} from "lucide-react";
import BrandModal from "./BrandModal";
import BrandDetailsDrawer from "./BrandDetailsDrawer";
import ResetPasswordModal from "./ResetPasswordModal";
import ConfirmModal from "./ConfirmModal";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
  resetBrandPassword,
} from "../../services/brands";

const PAGE_SIZE = 8;
function getErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(", ");
  }
  if (err?.response?.status === 401) return "Session expired. Please log in again.";
  if (err?.message === "Network Error") return "Cannot reach server. Is the backend running?";
  return fallback;
}

export default function BrandTable({ onBrandsChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [viewBrandId, setViewBrandId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetSaving, setResetSaving] = useState(false);

  const [menuBrandId, setMenuBrandId] = useState(null);
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
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setBrands(response.data.brands);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load brands"));
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(loadBrands, 300);
    return () => clearTimeout(timer);
  }, [loadBrands]);

  useEffect(() => {
    if (!menuBrandId) return;
    const closeMenu = (e) => {
      if (!e.target.closest(".bm-more-wrap")) {
        setMenuBrandId(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [menuBrandId]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

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
      showToast(getErrorMessage(err, "Failed to save brand"), "error");
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
      showToast(getErrorMessage(err, "Failed to delete brand"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const nextActive = !statusTarget.is_active;
    const prevBrands = brands;

    setBrands((list) =>
      list.map((b) =>
        b.user_id === statusTarget.user_id ? { ...b, is_active: nextActive } : b
      )
    );
    setStatusLoading(true);

    try {
      await updateBrandStatus(statusTarget.user_id, nextActive);
      showToast(nextActive ? "Brand activated" : "Brand deactivated");
      setStatusTarget(null);
      onBrandsChange?.();
    } catch (err) {
      setBrands(prevBrands);
      showToast(getErrorMessage(err, "Failed to update status"), "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResetPassword = async (password) => {
    if (!resetTarget) return;
    setResetSaving(true);
    try {
      await resetBrandPassword(resetTarget.user_id, password);
      showToast("Password reset successfully");
      setResetTarget(null);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to reset password"), "error");
    } finally {
      setResetSaving(false);
    }
  };

  const emptyMessage =
    search.trim() || statusFilter !== "all"
      ? "No brands match your search or filters."
      : "No brands found. Add your first brand to get started.";

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
        .bm-filter, .bm-retry {
          height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px; outline: none; font-family: 'Inter', sans-serif;
          font-size: 13px; cursor: pointer;
        }
        .bm-filter option { background: #1e1550; }
        .bm-retry {
          display: inline-flex; align-items: center; gap: 6px;
        }
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
        .bm-table {
          width: 100%; border-collapse: collapse;
          table-layout: fixed;
        }
        .bm-table th {
          text-align: left; padding: 18px 24px; font-size: 13px;
          color: rgba(255,255,255,0.45); font-weight: 600;
        }
        .bm-table th.bm-sortable {
          cursor: pointer; user-select: none;
          transition: color 0.15s;
        }
        .bm-table th.bm-sortable:hover { color: rgba(255,255,255,0.7); }
        .bm-table th.bm-sorted { color: #c4b5fd; }
        .bm-col-company { width: 28%; }
        .bm-col-contact { width: 32%; }
        .bm-col-package { width: 14%; }
        .bm-col-status { width: 8%; }
        .bm-table th.bm-col-status,
        .bm-table td.bm-td-status {
          text-align: center;
          padding-left: 12px;
          padding-right: 12px;
        }
        .bm-col-actions { width: 18%; }
        .bm-table td {
          padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88); font-size: 14px;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bm-table td.bm-td-actions {
          overflow: visible;
          padding-right: 20px;
        }
        .bm-company { font-weight: 600; color: #fff; }
        .bm-meta { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }
        .bm-status-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 10px;
          border: 1px solid transparent; cursor: pointer;
          background: rgba(255,255,255,0.06);
          transition: background 0.15s, color 0.15s;
        }
        .bm-status-icon.active {
          color: #4ade80;
          border-color: rgba(34,197,94,0.25);
        }
        .bm-status-icon.inactive {
          color: #f87171;
          border-color: rgba(239,68,68,0.25);
        }
        .bm-status-icon:hover { background: rgba(255,255,255,0.1); }
        .bm-actions-cell {
          display: flex; gap: 8px; align-items: center;
          justify-content: flex-end; flex-wrap: nowrap;
        }
        .bm-more-wrap { position: relative; }
        .bm-more-menu {
          position: absolute; right: 0; top: calc(100% + 6px);
          min-width: 168px; padding: 6px;
          background: rgba(30, 20, 70, 0.98);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; z-index: 20;
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }
        .bm-more-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px; border: none; border-radius: 8px;
          background: none; color: rgba(255,255,255,0.85);
          font-size: 13px; font-family: 'Inter', sans-serif;
          cursor: pointer; text-align: left;
        }
        .bm-more-item:hover { background: rgba(255,255,255,0.08); }
        .bm-more-item:disabled {
          opacity: 0.4; cursor: not-allowed;
        }
        .bm-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .bm-icon-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.12); color: #fff;
        }
        .bm-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .bm-icon-btn.danger:hover:not(:disabled) {
          background: rgba(239,68,68,0.15); color: #f87171;
        }
        .bm-empty, .bm-error-cell, .bm-loading {
          padding: 48px 24px; text-align: center;
          color: rgba(255,255,255,0.45); font-size: 14px;
        }
        .bm-error-cell { color: #f87171; }
        .bm-error-cell button { margin-top: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
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
                <th
                  className={`bm-col-company bm-sortable${
                    sortBy === "company_name" ? " bm-sorted" : ""
                  }`}
                  onClick={() => handleSort("company_name")}
                >
                  Company
                </th>
                <th
                  className={`bm-col-contact bm-sortable${
                    sortBy === "email" ? " bm-sorted" : ""
                  }`}
                  onClick={() => handleSort("email")}
                >
                  Contact
                </th>
                <th
                  className={`bm-col-package bm-sortable${
                    sortBy === "package" ? " bm-sorted" : ""
                  }`}
                  onClick={() => handleSort("package")}
                >
                  Package
                </th>
                <th
                  className={`bm-col-status bm-sortable${
                    sortBy === "is_active" ? " bm-sorted" : ""
                  }`}
                  onClick={() => handleSort("is_active")}
                >
                  Status
                </th>
                <th className="bm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
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
                  <td colSpan={5}>
                    <div className="bm-error-cell">
                      {error}
                      <br />
                      <button
                        type="button"
                        className="bm-retry"
                        onClick={loadBrands}
                      >
                        <RotateCcw size={16} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="bm-empty">{emptyMessage}</div>
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
                    <td className="bm-td-status">
                      <button
                        type="button"
                        className={`bm-status-icon ${
                          brand.is_active ? "active" : "inactive"
                        }`}
                        title={
                          brand.is_active
                            ? "Active — click to deactivate"
                            : "Inactive — click to activate"
                        }
                        onClick={() => setStatusTarget(brand)}
                      >
                        {brand.is_active ? (
                          <CircleCheck size={18} />
                        ) : (
                          <CircleX size={18} />
                        )}
                      </button>
                    </td>
                    <td className="bm-td-actions">
                      <div className="bm-actions-cell">
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
                        <div className="bm-more-wrap">
                          <button
                            type="button"
                            className="bm-icon-btn"
                            title="More actions"
                            onClick={() =>
                              setMenuBrandId((id) =>
                                id === brand.user_id ? null : brand.user_id
                              )
                            }
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {menuBrandId === brand.user_id && (
                            <div className="bm-more-menu">
                              <button
                                type="button"
                                className="bm-more-item"
                                onClick={() => {
                                  setViewBrandId(brand.user_id);
                                  setMenuBrandId(null);
                                }}
                              >
                                <Eye size={15} />
                                View details
                              </button>
                              <button
                                type="button"
                                className="bm-more-item"
                                onClick={() => {
                                  setResetTarget(brand);
                                  setMenuBrandId(null);
                                }}
                              >
                                <KeyRound size={15} />
                                Reset password
                              </button>
                            </div>
                          )}
                        </div>
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

      <BrandDetailsDrawer
        open={!!viewBrandId}
        brandId={viewBrandId}
        onClose={() => setViewBrandId(null)}
      />

      <ResetPasswordModal
        open={!!resetTarget}
        brand={resetTarget}
        onClose={() => setResetTarget(null)}
        onSave={handleResetPassword}
        saving={resetSaving}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete brand?"
        message={
          deleteTarget ? (
            <>
              This will soft-delete <strong>{deleteTarget.company_name}</strong>.
              The brand will no longer appear in the list.
            </>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!statusTarget}
        title={
          statusTarget?.is_active
            ? "Deactivate brand?"
            : "Activate brand?"
        }
        message={
          statusTarget?.is_active ? (
            <>
              <strong>{statusTarget.company_name}</strong> will lose access until
              activated again.
            </>
          ) : (
            <>
              <strong>{statusTarget?.company_name}</strong> will regain platform
              access.
            </>
          )
        }
        confirmLabel={
          statusTarget?.is_active ? "Deactivate" : "Activate"
        }
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTarget(null)}
        loading={statusLoading}
        danger={statusTarget?.is_active}
      />

      {toast && (
        <div className={`bm-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
