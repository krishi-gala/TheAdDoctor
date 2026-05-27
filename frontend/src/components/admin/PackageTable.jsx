import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Loader2,
  RotateCcw,
} from "lucide-react";
import PackageModal from "./PackageModal";
import ConfirmModal from "./ConfirmModal";
import {
  fetchAdminPackages,
  createPackage,
  updatePackage,
  updatePackageStatus,
} from "../../services/packages";

const PAGE_SIZE = 8;

function getErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(", ");
  }
  return fallback;
}

export default function PackageTable({ onPackagesChange }) {
  const [packages, setPackages] = useState([]);
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
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminPackages({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        page_size: PAGE_SIZE,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setPackages(response.data.packages);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load packages"));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(loadPackages, 300);
    return () => clearTimeout(timer);
  }, [loadPackages]);

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
    setSelectedPackage(null);
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setModalMode("edit");
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === "add") {
        await createPackage(payload);
        showToast("Package created successfully");
        setPage(1);
      } else {
        await updatePackage(selectedPackage.package_id, payload);
        showToast("Package updated successfully");
      }
      setModalOpen(false);
      await loadPackages();
      onPackagesChange?.();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to save package"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const nextActive = !statusTarget.is_active;
    const prevPackages = packages;

    setPackages((list) =>
      list.map((p) =>
        p.package_id === statusTarget.package_id ? { ...p, is_active: nextActive } : p
      )
    );
    setStatusLoading(true);

    try {
      await updatePackageStatus(statusTarget.package_id, nextActive);
      showToast(nextActive ? "Package activated" : "Package disabled");
      setStatusTarget(null);
      onPackagesChange?.();
    } catch (err) {
      setPackages(prevPackages);
      showToast(getErrorMessage(err, "Failed to update status"), "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const emptyMessage =
    search.trim() || statusFilter !== "all"
      ? "No packages match your search or filters."
      : "No packages found. Create one to get started.";

  return (
    <>
      <style>{`
        .pk-wrap { margin-top: 34px; }
        .pk-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 22px; flex-wrap: wrap; gap: 16px;
        }
        .pk-title { font-size: 24px; font-weight: 700; color: #fff; }
        .pk-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .pk-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .pk-search { position: relative; }
        .pk-search input {
          width: 240px; height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px 0 42px; outline: none; font-family: 'Inter', sans-serif;
        }
        .pk-search input::placeholder { color: rgba(255,255,255,0.3); }
        .pk-search-icon {
          position: absolute; top: 50%; left: 14px;
          transform: translateY(-50%); color: rgba(255,255,255,0.4);
        }
        .pk-filter, .pk-retry {
          height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: #fff;
          padding: 0 14px; outline: none; font-family: 'Inter', sans-serif;
          font-size: 13px; cursor: pointer;
        }
        .pk-filter option { background: #1e1550; }
        .pk-retry {
          display: inline-flex; align-items: center; gap: 6px;
        }
        .pk-btn {
          height: 42px; padding: 0 18px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif;
        }
        .pk-table-wrap {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; overflow: hidden; backdrop-filter: blur(18px);
        }
        .pk-table {
          width: 100%; border-collapse: collapse;
          table-layout: fixed;
        }
        .pk-table th {
          text-align: left; padding: 18px 24px; font-size: 13px;
          color: rgba(255,255,255,0.45); font-weight: 600;
        }
        .pk-table th.pk-sortable {
          cursor: pointer; user-select: none;
          transition: color 0.15s;
        }
        .pk-table th.pk-sortable:hover { color: rgba(255,255,255,0.7); }
        .pk-table th.pk-sorted { color: #c4b5fd; }
        .pk-col-name { width: 30%; }
        .pk-col-price { width: 15%; }
        .pk-col-credits { width: 15%; }
        .pk-col-validity { width: 15%; }
        .pk-col-status { width: 10%; }
        .pk-table th.pk-col-status,
        .pk-table td.pk-td-status {
          text-align: center;
        }
        .pk-col-actions { width: 15%; }
        .pk-table td {
          padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88); font-size: 14px;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pk-table td.pk-td-actions {
          overflow: visible;
        }
        .pk-name { font-weight: 600; color: #fff; }
        .pk-description { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }
        .pk-status-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 10px;
          border: 1px solid transparent; cursor: pointer;
          background: rgba(255,255,255,0.06);
          transition: background 0.15s, color 0.15s;
        }
        .pk-status-icon.active {
          color: #4ade80;
          border-color: rgba(34,197,94,0.25);
        }
        .pk-status-icon.inactive {
          color: #f87171;
          border-color: rgba(239,68,68,0.25);
        }
        .pk-status-icon:hover { background: rgba(255,255,255,0.1); }
        .pk-actions-cell {
          display: flex; gap: 8px; align-items: center;
          justify-content: flex-end;
        }
        .pk-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .pk-icon-btn:hover {
          background: rgba(255,255,255,0.12); color: #fff;
        }
        .pk-empty, .pk-error-cell, .pk-loading {
          padding: 48px 24px; text-align: center;
          color: rgba(255,255,255,0.45); font-size: 14px;
        }
        .pk-error-cell { color: #f87171; }
        .pk-error-cell button { margin-top: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pk-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .pk-count { font-size: 13px; color: rgba(255,255,255,0.4); }
        .pk-pagination { display: flex; gap: 8px; align-items: center; }
        .pk-page-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .pk-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pk-page-btn:not(:disabled):hover { background: rgba(255,255,255,0.12); color: #fff; }
        .pk-page-num { font-size: 13px; color: rgba(255,255,255,0.5); min-width: 80px; text-align: center; }
        .pk-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
          backdrop-filter: blur(12px);
          animation: pk-slide-in 0.25s ease;
        }
        .pk-toast.success {
          background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.35);
          color: #4ade80;
        }
        .pk-toast.error {
          background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.35);
          color: #f87171;
        }
        @keyframes pk-slide-in {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="pk-wrap">
        <div className="pk-head">
          <div>
            <h2 className="pk-title">Package Management</h2>
            <p className="pk-subtitle">
              {total} package{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="pk-actions">
            <div className="pk-search">
              <Search size={18} className="pk-search-icon" />
              <input
                type="text"
                placeholder="Search packages..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="pk-filter"
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

            <button type="button" className="pk-btn" onClick={openAddModal}>
              <Plus size={18} />
              Create Package
            </button>
          </div>
        </div>

        <div className="pk-table-wrap">
          <table className="pk-table">
            <thead>
              <tr>
                <th
                  className={`pk-col-name pk-sortable${
                    sortBy === "package_name" ? " pk-sorted" : ""
                  }`}
                  onClick={() => handleSort("package_name")}
                >
                  Package Name
                </th>
                <th
                  className={`pk-col-price pk-sortable${
                    sortBy === "price" ? " pk-sorted" : ""
                  }`}
                  onClick={() => handleSort("price")}
                >
                  Price
                </th>
                <th
                  className={`pk-col-credits pk-sortable${
                    sortBy === "credits" ? " pk-sorted" : ""
                  }`}
                  onClick={() => handleSort("credits")}
                >
                  Credits
                </th>
                <th
                  className={`pk-col-validity pk-sortable${
                    sortBy === "validity_days" ? " pk-sorted" : ""
                  }`}
                  onClick={() => handleSort("validity_days")}
                >
                  Validity
                </th>
                <th
                  className={`pk-col-status pk-sortable${
                    sortBy === "is_active" ? " pk-sorted" : ""
                  }`}
                  onClick={() => handleSort("is_active")}
                >
                  Status
                </th>
                <th className="pk-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="pk-loading">
                      <Loader2
                        size={24}
                        style={{
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 8px",
                          display: "block",
                        }}
                      />
                      Loading packages...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="pk-error-cell">
                      {error}
                      <br />
                      <button
                        type="button"
                        className="pk-retry"
                        onClick={loadPackages}
                      >
                        <RotateCcw size={16} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="pk-empty">{emptyMessage}</div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td>
                      <div className="pk-name">{pkg.package_name}</div>
                      {pkg.description && (
                        <div className="pk-description">{pkg.description}</div>
                      )}
                    </td>
                    <td>₹{parseFloat(pkg.price).toLocaleString("en-IN")}</td>
                    <td>{pkg.credits} credits</td>
                    <td>{pkg.validity_days} days</td>
                    <td className="pk-td-status">
                      <button
                        type="button"
                        className={`pk-status-icon ${
                          pkg.is_active ? "active" : "inactive"
                        }`}
                        title={
                          pkg.is_active
                             ? "Active — click to disable"
                             : "Inactive — click to activate"
                        }
                        onClick={() => setStatusTarget(pkg)}
                      >
                        {pkg.is_active ? (
                          <CircleCheck size={18} />
                        ) : (
                          <CircleX size={18} />
                        )}
                      </button>
                    </td>
                    <td className="pk-td-actions">
                      <div className="pk-actions-cell">
                        <button
                          type="button"
                          className="pk-icon-btn"
                          title="Edit"
                          onClick={() => openEditModal(pkg)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && !error && packages.length > 0 && (
            <div className="pk-footer">
              <span className="pk-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="pk-pagination">
                <button
                  type="button"
                  className="pk-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="pk-page-num">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="pk-page-btn"
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

      <PackageModal
        open={modalOpen}
        mode={modalMode}
        packageData={selectedPackage}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmModal
        open={!!statusTarget}
        title={
          statusTarget?.is_active
            ? "Deactivate package?"
            : "Activate package?"
        }
        message={
          statusTarget?.is_active ? (
            <>
              Brands will no longer be able to purchase{" "}
              <strong>{statusTarget.package_name}</strong>.
            </>
          ) : (
            <>
              <strong>{statusTarget?.package_name}</strong> will be visible to
              brands for purchase immediately.
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
        <div className={`pk-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
