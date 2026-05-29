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
import { useBrandTable } from "../../hooks/useBrandTable";

// ─── Styles ───────────────────────────────────────────────────────────────────
// Scoped BEM-style classes to avoid global collisions
const styles = `
  .bm-wrap { margin-top: 34px; }
  .bm-head {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 22px; flex-wrap: wrap; gap: 16px;
  }
  .bm-title { font-size: 24px; font-weight: 700; color: #fff; }
  .bm-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .bm-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
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
  .bm-retry { display: inline-flex; align-items: center; gap: 6px; }
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
  .bm-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .bm-table th {
    text-align: left; padding: 18px 24px; font-size: 13px;
    color: rgba(255,255,255,0.45); font-weight: 600;
  }
  .bm-table th.bm-sortable { cursor: pointer; user-select: none; transition: color 0.15s; }
  .bm-table th.bm-sortable:hover { color: rgba(255,255,255,0.7); }
  .bm-table th.bm-sorted { color: #c4b5fd; }
  .bm-col-company { width: 28%; }
  .bm-col-contact { width: 32%; }
  .bm-col-package { width: 14%; }
  .bm-col-status { width: 8%; }
  .bm-table th.bm-col-status, .bm-table td.bm-td-status {
    text-align: center; padding-left: 12px; padding-right: 12px;
  }
  .bm-col-actions { width: 18%; }
  .bm-table td {
    padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.88); font-size: 14px;
    vertical-align: middle; overflow: hidden; text-overflow: ellipsis;
  }
  .bm-table td.bm-td-actions { overflow: visible; padding-right: 20px; }
  .bm-company { font-weight: 600; color: #fff; }
  .bm-meta { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }
  .bm-status-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid transparent; cursor: pointer;
    background: rgba(255,255,255,0.06); transition: background 0.15s, color 0.15s;
  }
  .bm-status-icon.active { color: #4ade80; border-color: rgba(34,197,94,0.25); }
  .bm-status-icon.inactive { color: #f87171; border-color: rgba(239,68,68,0.25); }
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
  .bm-icon-btn {
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .bm-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
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
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .bm-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .bm-page-btn:not(:disabled):hover { background: rgba(255,255,255,0.12); color: #fff; }
  .bm-page-num { font-size: 13px; color: rgba(255,255,255,0.5); min-width: 80px; text-align: center; }
  .bm-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 200;
    padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
    backdrop-filter: blur(12px); animation: bm-slide-in 0.25s ease;
  }
  .bm-toast.success {
    background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.35); color: #4ade80;
  }
  .bm-toast.error {
    background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35); color: #f87171;
  }
  @keyframes bm-slide-in {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TableHeader({ sortBy, sortDir, onSort }) {
  const col = (key, label, className) => (
    <th
      className={`${className} bm-sortable${sortBy === key ? " bm-sorted" : ""}`}
      onClick={() => onSort(key)}
    >
      {label} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <thead>
      <tr>
        {col("company_name", "Company",  "bm-col-company")}
        {col("email",        "Contact",  "bm-col-contact")}
        {col("package",      "Package",  "bm-col-package")}
        {col("is_active",    "Status",   "bm-col-status")}
        <th className="bm-col-actions">Actions</th>
      </tr>
    </thead>
  );
}

function BrandRow({ brand, onEdit, onDelete, onStatusClick, onView, onResetPassword, menuBrandId, setMenuBrandId }) {
  const isMenuOpen = menuBrandId === brand.user_id;

  const toggleMenu = () =>
    setMenuBrandId((id) => (id === brand.user_id ? null : brand.user_id));

  return (
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
          className={`bm-status-icon ${brand.is_active ? "active" : "inactive"}`}
          title={brand.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}
          onClick={() => onStatusClick(brand)}
        >
          {brand.is_active ? <CircleCheck size={18} /> : <CircleX size={18} />}
        </button>
      </td>

      <td className="bm-td-actions">
        <div className="bm-actions-cell">
          <button type="button" className="bm-icon-btn" title="Edit" onClick={() => onEdit(brand)}>
            <Pencil size={16} />
          </button>

          <button type="button" className="bm-icon-btn danger" title="Delete" onClick={() => onDelete(brand)}>
            <Trash2 size={16} />
          </button>

          <div className="bm-more-wrap">
            <button type="button" className="bm-icon-btn" title="More actions" onClick={toggleMenu}>
              <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
              <div className="bm-more-menu">
                <button
                  type="button"
                  className="bm-more-item"
                  onClick={() => { onView(brand.user_id); setMenuBrandId(null); }}
                >
                  <Eye size={15} /> View details
                </button>
                <button
                  type="button"
                  className="bm-more-item"
                  onClick={() => { onResetPassword(brand); setMenuBrandId(null); }}
                >
                  <KeyRound size={15} /> Reset password
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function TableBody({ brands, loading, error, emptyMessage, onRetry, ...rowProps }) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={5}>
            <div className="bm-loading">
              <Loader2
                size={24}
                style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px", display: "block" }}
              />
              Loading brands...
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={5}>
            <div className="bm-error-cell">
              {error}
              <br />
              <button type="button" className="bm-retry" onClick={onRetry}>
                <RotateCcw size={16} /> Retry
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (brands.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={5}>
            <div className="bm-empty">{emptyMessage}</div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {brands.map((brand) => (
        <BrandRow key={brand.user_id} brand={brand} {...rowProps} />
      ))}
    </tbody>
  );
}

function TableFooter({ page, totalPages, total, PAGE_SIZE, onPrev, onNext }) {
  return (
    <div className="bm-footer">
      <span className="bm-count">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div className="bm-pagination">
        <button type="button" className="bm-page-btn" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft size={18} />
        </button>
        <span className="bm-page-num">{page} / {totalPages}</span>
        <button type="button" className="bm-page-btn" disabled={page >= totalPages} onClick={onNext}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandTable({ onBrandsChange }) {
  const {
    // List
    brands, loading, error, total, totalPages, emptyMessage, PAGE_SIZE,
    // Filters
    search, statusFilter, page, sortBy, sortDir,
    handleSearchChange, handleStatusFilterChange, setPage, handleSort, loadBrands,
    // Add/Edit
    modalOpen, modalMode, selectedBrand, saving,
    openAddModal, openEditModal, closeModal, handleSave,
    // Delete
    deleteTarget, deleting, setDeleteTarget, handleDelete,
    // Status
    statusTarget, statusLoading, setStatusTarget, handleToggleStatus,
    // View
    viewBrandId, setViewBrandId,
    // Reset password
    resetTarget, resetSaving, setResetTarget, handleResetPassword,
    // Menu
    menuBrandId, setMenuBrandId,
    // Toast
    toast,
  } = useBrandTable({ onBrandsChange });

  return (
    <>
      <style>{styles}</style>

      <div className="bm-wrap">
        {/* ── Header ── */}
        <div className="bm-head">
          <div>
            <h2 className="bm-title">Brand Management</h2>
            <p className="bm-subtitle">
              {total} brand{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="bm-toolbar">
            <div className="bm-search">
              <Search size={18} className="bm-search-icon" />
              <input
                type="text"
                placeholder="Search brand..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <select
              className="bm-filter"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="button" className="bm-btn" onClick={openAddModal}>
              <Plus size={18} /> Add Brand
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bm-table-wrap">
          <table className="bm-table">
            <TableHeader sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            <TableBody
              brands={brands}
              loading={loading}
              error={error}
              emptyMessage={emptyMessage}
              onRetry={loadBrands}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
              onStatusClick={setStatusTarget}
              onView={setViewBrandId}
              onResetPassword={setResetTarget}
              menuBrandId={menuBrandId}
              setMenuBrandId={setMenuBrandId}
            />
          </table>

          {!loading && !error && brands.length > 0 && (
            <TableFooter
              page={page}
              totalPages={totalPages}
              total={total}
              PAGE_SIZE={PAGE_SIZE}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </div>
      </div>

      {/* ── Modals & Drawers ── */}
      <BrandModal
        open={modalOpen}
        mode={modalMode}
        brand={selectedBrand}
        onClose={closeModal}
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
        title={statusTarget?.is_active ? "Deactivate brand?" : "Activate brand?"}
        message={
          statusTarget?.is_active ? (
            <><strong>{statusTarget.company_name}</strong> will lose access until activated again.</>
          ) : (
            <><strong>{statusTarget?.company_name}</strong> will regain platform access.</>
          )
        }
        confirmLabel={statusTarget?.is_active ? "Deactivate" : "Activate"}
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