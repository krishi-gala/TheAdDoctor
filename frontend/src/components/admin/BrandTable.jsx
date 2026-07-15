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
import CreditsModal from "./CreditsModal";
import ConfirmModal from "./ConfirmModal";
import { useBrandTable } from "../../hooks/useBrandTable";
import "./BrandTable.css";

// ─── Styles moved to BrandTable.css (bt- prefix) ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

function TableHeader({ sortBy, sortDir, onSort }) {
  const col = (key, label, className) => (
    <th
      className={`${className} bt-sortable${sortBy === key ? " bt-sorted" : ""}`}
      onClick={() => onSort(key)}
    >
      {label} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <thead>
      <tr>
        {col("company_name", "Company",  "bt-col-company")}
        {col("email",        "Contact",  "bt-col-contact")}
        {col("package",      "Package",  "bt-col-package")}
        {col("remaining_credits", "Credits Left", "bt-col-credits")}
        {col("is_active",    "Status",   "bt-col-status")}
        <th className="bt-col-actions">Actions</th>
      </tr>
    </thead>
  );
}

function BrandRow({ brand, onEdit, onDelete, onStatusClick, onView, onResetPassword, onEditCredits, menuBrandId, setMenuBrandId }) {
  const isMenuOpen = menuBrandId === brand.user_id;

  const toggleMenu = () =>
    setMenuBrandId((id) => (id === brand.user_id ? null : brand.user_id));

  return (
    <tr key={brand.user_id}>
      <td>
        <div className="bt-company">{brand.company_name}</div>
        {brand.business_type && (
          <div className="bt-meta">{brand.business_type}</div>
        )}
      </td>

      <td>
        <div>{brand.email}</div>
        {brand.phone_number && (
          <div className="bt-meta">{brand.phone_number}</div>
        )}
      </td>

      <td>{brand.package || "—"}</td>

      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {brand.remaining_credits === null || brand.remaining_credits === undefined ? (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontSize: '13px' }}>—</span>
            ) : (
              <>
                <span>{brand.remaining_credits} Credits</span>
                <button 
                    type="button" 
                    className="bt-icon-btn" 
                    style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                    title="Edit Credits" 
                    onClick={() => onEditCredits(brand)}
                >
                    <Pencil size={14} />
                </button>
              </>
            )}
        </div>
      </td>

      <td className="bt-td-status">
        <button
          type="button"
          className={`bt-status-icon ${brand.is_active ? "active" : "inactive"}`}
          title={brand.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}
          onClick={() => onStatusClick(brand)}
        >
          {brand.is_active ? <CircleCheck size={18} /> : <CircleX size={18} />}
        </button>
      </td>

      <td className="bt-td-actions">
        <div className="bt-actions-cell">
          <button type="button" className="bt-icon-btn" title="Edit" onClick={() => onEdit(brand)}>
            <Pencil size={16} />
          </button>

          <button type="button" className="bt-icon-btn danger" title="Delete" onClick={() => onDelete(brand)}>
            <Trash2 size={16} />
          </button>

          <div className="bt-more-wrap">
            <button type="button" className="bt-icon-btn" title="More actions" onClick={toggleMenu}>
              <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
              <div className="bt-more-menu">
                <button
                  type="button"
                  className="bt-more-item"
                  onClick={() => { onView(brand.user_id); setMenuBrandId(null); }}
                >
                  <Eye size={15} /> View details
                </button>
                <button
                  type="button"
                  className="bt-more-item"
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
          <td colSpan={6}>
            <div className="bt-loading">
              <Loader2 size={24} className="bt-loader-icon" />
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
          <td colSpan={6}>
            <div className="bt-error-cell">
              {error}
              <br />
              <button type="button" className="bt-retry" onClick={onRetry}>
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
          <td colSpan={6}>
            <div className="bt-empty">{emptyMessage}</div>
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
    <div className="bt-footer">
      <span className="bt-count">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div className="bt-pagination">
        <button type="button" className="bt-page-btn" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft size={18} />
        </button>
        <span className="bt-page-num">{page} / {totalPages}</span>
        <button type="button" className="bt-page-btn" disabled={page >= totalPages} onClick={onNext}>
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
    // Credits
    creditsTarget, creditsSaving, setCreditsTarget, handleUpdateCredits,
    // Menu
    menuBrandId, setMenuBrandId,
    // Toast
    toast,
  } = useBrandTable({ onBrandsChange });

  return (
    <>
      {/* Styles moved to BrandTable.css (bt- prefix) */}

      <div className="bt-wrap">
        {/* ── Header ── */}
        <div className="bt-head">
          <div>
            <h2 className="bt-title">Brand Management</h2>
            <p className="bt-subtitle">
              {total} brand{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="bt-toolbar">
            <div className="bt-search">
              <Search size={18} className="bt-search-icon" />
              <input
                type="text"
                placeholder="Search brand..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <select
              className="bt-filter"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="button" className="bt-btn" onClick={openAddModal}>
              <Plus size={18} /> Add Brand
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bt-table-wrap">
          <table className="bt-table">
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
              onEditCredits={setCreditsTarget}
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

      <CreditsModal
        open={!!creditsTarget}
        brand={creditsTarget}
        onClose={() => setCreditsTarget(null)}
        onSave={handleUpdateCredits}
        saving={creditsSaving}
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
        <div className={`bt-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}