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
import "./PackageTable.css";

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
      {/* Styles moved to PackageTable.css (apkg- prefix) */}

      <div className="apkg-wrap">
        <div className="apkg-head">
          <div>
            <h2 className="apkg-title">Package Management</h2>
            <p className="apkg-subtitle">
              {total} package{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          <div className="apkg-actions">
            <div className="apkg-search">
              <Search size={18} className="apkg-search-icon" />
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
              className="apkg-filter"
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

            <button type="button" className="apkg-btn" onClick={openAddModal}>
              <Plus size={18} />
              Create Package
            </button>
          </div>
        </div>

        <div className="apkg-table-wrap">
          <table className="apkg-table">
            <thead>
              <tr>
                <th
                  className={`apkg-col-name apkg-sortable${
                    sortBy === "package_name" ? " apkg-sorted" : ""
                  }`}
                  onClick={() => handleSort("package_name")}
                >
                  Package Name
                </th>
                <th
                  className={`apkg-col-price apkg-sortable${
                    sortBy === "price" ? " apkg-sorted" : ""
                  }`}
                  onClick={() => handleSort("price")}
                >
                  Price
                </th>
                <th
                  className={`apkg-col-credits apkg-sortable${
                    sortBy === "credits" ? " apkg-sorted" : ""
                  }`}
                  onClick={() => handleSort("credits")}
                >
                  Credits
                </th>
                <th
                  className={`apkg-col-validity apkg-sortable${
                    sortBy === "validity_days" ? " apkg-sorted" : ""
                  }`}
                  onClick={() => handleSort("validity_days")}
                >
                  Validity
                </th>
                <th
                  className={`apkg-col-status apkg-sortable${
                    sortBy === "is_active" ? " apkg-sorted" : ""
                  }`}
                  onClick={() => handleSort("is_active")}
                >
                  Status
                </th>
                <th className="apkg-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="apkg-loading">
                      <Loader2 size={24} className="apkg-loader-icon" />
                      Loading packages...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="apkg-error-cell">
                      {error}
                      <br />
                      <button
                        type="button"
                        className="apkg-retry"
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
                    <div className="apkg-empty">{emptyMessage}</div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td>
                      <div className="apkg-name">{pkg.package_name}</div>
                      {pkg.description && (
                        <div className="apkg-description">{pkg.description}</div>
                      )}
                    </td>
                    <td>₹{parseFloat(pkg.price).toLocaleString("en-IN")}</td>
                    <td>{pkg.credits} credits</td>
                    <td>{pkg.validity_days} days</td>
                    <td className="apkg-td-status">
                      <button
                        type="button"
                        className={`apkg-status-icon ${
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
                    <td className="apkg-td-actions">
                      <div className="apkg-actions-cell">
                        <button
                          type="button"
                          className="apkg-icon-btn"
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
            <div className="apkg-footer">
              <span className="apkg-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="apkg-pagination">
                <button
                  type="button"
                  className="apkg-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="apkg-page-num">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="apkg-page-btn"
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
        <div className={`apkg-toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
