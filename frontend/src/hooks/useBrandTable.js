import { useCallback, useEffect, useState } from "react";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
  resetBrandPassword,
  updateBrandCredits,
} from "../services/brands";

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

export function useBrandTable({ onBrandsChange } = {}) {
  // ─── List state ───────────────────────────────────────────────
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Filter / sort / page ─────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // ─── Modal / drawer state ─────────────────────────────────────
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

  const [creditsTarget, setCreditsTarget] = useState(null);
  const [creditsSaving, setCreditsSaving] = useState(false);

  // ─── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ─── Load brands ──────────────────────────────────────────────
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

  // Debounced load on filter/sort/page change
  useEffect(() => {
    const timer = setTimeout(loadBrands, 300);
    return () => clearTimeout(timer);
  }, [loadBrands]);

  // Close dropdown menu on outside click
  useEffect(() => {
    if (!menuBrandId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".bm-more-wrap")) {
        setMenuBrandId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuBrandId]);

  // ─── Sort ─────────────────────────────────────────────────────
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ─── Search & filter ──────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  // ─── Add / Edit modal ─────────────────────────────────────────
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

  const closeModal = () => setModalOpen(false);

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

  // ─── Delete ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(deleteTarget.user_id);
      showToast("Brand deleted successfully");
      setDeleteTarget(null);
      // Go back a page if the last item on a non-first page was deleted
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

  // ─── Toggle status (optimistic update) ───────────────────────
  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const nextActive = !statusTarget.is_active;
    const prevBrands = brands;

    // Optimistically update the UI before the API responds
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
      setBrands(prevBrands); // Roll back on failure
      showToast(getErrorMessage(err, "Failed to update status"), "error");
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Reset password ───────────────────────────────────────────
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

  // ─── Update credits ───────────────────────────────────────────
  const handleUpdateCredits = async (action, amount) => {
    if (!creditsTarget) return;
    setCreditsSaving(true);
    try {
      await updateBrandCredits(creditsTarget.user_id, action, amount);
      showToast(`${amount} credits ${action}ed successfully`);
      setCreditsTarget(null);
      await loadBrands();
      onBrandsChange?.();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to update credits"), "error");
    } finally {
      setCreditsSaving(false);
    }
  };

  // ─── Derived values ───────────────────────────────────────────
  const emptyMessage =
    search.trim() || statusFilter !== "all"
      ? "No brands match your search or filters."
      : "No brands found. Add your first brand to get started.";

  // ─── Exposed interface ────────────────────────────────────────
  return {
    // List data
    brands,
    loading,
    error,
    total,
    totalPages,
    emptyMessage,
    PAGE_SIZE,

    // Filters
    search,
    statusFilter,
    page,
    sortBy,
    sortDir,
    handleSearchChange,
    handleStatusFilterChange,
    setPage,
    handleSort,
    loadBrands,

    // Add/Edit modal
    modalOpen,
    modalMode,
    selectedBrand,
    saving,
    openAddModal,
    openEditModal,
    closeModal,
    handleSave,

    // Delete
    deleteTarget,
    deleting,
    setDeleteTarget,
    handleDelete,

    // Status toggle
    statusTarget,
    statusLoading,
    setStatusTarget,
    handleToggleStatus,

    // View drawer
    viewBrandId,
    setViewBrandId,

    // Reset password
    resetTarget,
    resetSaving,
    setResetTarget,
    handleResetPassword,

    // Credits
    creditsTarget,
    creditsSaving,
    setCreditsTarget,
    handleUpdateCredits,

    // Dropdown menu
    menuBrandId,
    setMenuBrandId,

    // Toast
    toast,
  };
}