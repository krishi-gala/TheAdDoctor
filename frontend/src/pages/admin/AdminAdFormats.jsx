import { useState, useEffect } from "react";
import { Loader2, Edit2, Clock, X, Plus, Trash2, CalendarClock } from "lucide-react";
import { fetchAdminAdFormats, updateAdFormat, updateAdFormatStatus } from "../../services/adFormats";
import { 
  fetchAdminTimingsByBusiness,
  createAdminTiming, 
  updateAdminTiming, 
  toggleAdminTiming, 
  deleteAdminTiming,
  fetchAdminTimings
} from "../../services/smartTiming";
import ConfirmModal from "../../components/admin/ConfirmModal";
import "./AdminAdFormats.css";

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
  "Other"
];

export default function AdminAdFormats() {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(null);
  const [confirmToggleFormat, setConfirmToggleFormat] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  
  const [formData, setFormData] = useState({
    weekly_limit: 5,
    standard_credits: 0,
    prime_credits: 0,
    estimated_performance: ""
  });

  // Smart Timing State
  const [selectedBusinessType, setSelectedBusinessType] = useState(BUSINESS_TYPES[0]);
  const [timings, setTimings] = useState([]);
  const [timingsLoading, setTimingsLoading] = useState(false);
  
  const [timingDrawerOpen, setTimingDrawerOpen] = useState(false);
  const [activeFormatForTiming, setActiveFormatForTiming] = useState(null);

  const [timingFormOpen, setTimingFormOpen] = useState(false);
  const [editingTiming, setEditingTiming] = useState(null);
  const [timingFormData, setTimingFormData] = useState({
    format_slug: "",
    best_day: "Wednesday",
    prime_time_start: "12 PM",
    prime_time_end: "3 PM",
    high_engagement_window: "Mid-day rush",
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminAdFormats({ skip: 0, limit: 100 });
      setFormats(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadTimings = async (businessType, format) => {
    if (!format) return;
    try {
      setTimingsLoading(true);
      // Fetch includeInactive=true for admin
      const res = await fetchAdminTimings(format.slug, businessType, true);
      setTimings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeFormatForTiming) {
      loadTimings(selectedBusinessType, activeFormatForTiming);
    }
  }, [selectedBusinessType, activeFormatForTiming]);

  const handleManageTimingClick = (format) => {
    setActiveFormatForTiming(format);
    setSelectedBusinessType(BUSINESS_TYPES[0]);
    setTimingDrawerOpen(true);
  };

  const handleCloseTimingDrawer = () => {
    setTimingDrawerOpen(false);
    setActiveFormatForTiming(null);
    setTimings([]);
  };

  const handleEditClick = (format) => {
    setCurrentFormat(format);
    setFormData({
      weekly_limit: format.weekly_limit,
      standard_credits: format.standard_credits,
      prime_credits: format.prime_credits,
      estimated_performance: format.estimated_performance || ""
    });
    setEditDialog(true);
  };

  const handleClose = () => {
    setEditDialog(false);
    setCurrentFormat(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateAdFormat(currentFormat.format_id, {
        weekly_limit: parseInt(formData.weekly_limit),
        standard_credits: parseInt(formData.standard_credits),
        prime_credits: parseInt(formData.prime_credits),
        estimated_performance: formData.estimated_performance
      });
      loadData();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleClick = (format) => {
    setConfirmToggleFormat(format);
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggleFormat) return;
    setIsToggling(true);
    try {
      await updateAdFormatStatus(confirmToggleFormat.format_id, !confirmToggleFormat.is_active);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
      setConfirmToggleFormat(null);
    }
  };

  // Smart Timing Handlers
  const handleAddTiming = () => {
    setEditingTiming(null);
    setTimingFormData({
      format_slug: activeFormatForTiming?.slug || "",
      best_day: "Wednesday",
      prime_time_start: "12 PM",
      prime_time_end: "3 PM",
      high_engagement_window: "",
      is_active: true
    });
    setTimingFormOpen(true);
  };

  const handleEditTiming = (timing) => {
    setEditingTiming(timing);
    setTimingFormData({
      format_slug: timing.format_slug,
      best_day: timing.best_day,
      prime_time_start: timing.prime_time_start,
      prime_time_end: timing.prime_time_end,
      high_engagement_window: timing.high_engagement_window,
      is_active: timing.is_active
    });
    setTimingFormOpen(true);
  };

  const handleSaveTiming = async (e) => {
    e.preventDefault();
    try {
      if (editingTiming) {
        await updateAdminTiming(editingTiming.recommendation_id, timingFormData);
      } else {
        await createAdminTiming(timingFormData.format_slug, selectedBusinessType, timingFormData);
      }
      setTimingFormOpen(false);
      loadTimings(selectedBusinessType, activeFormatForTiming);
    } catch (err) {
      console.error("Failed to save timing", err);
    }
  };

  const handleToggleTimingStatus = async (timing) => {
    try {
      await toggleAdminTiming(timing.recommendation_id, !timing.is_active);
      loadTimings(selectedBusinessType, activeFormatForTiming);
    } catch (err) {
      console.error("Failed to toggle timing", err);
    }
  };

  const handleDeleteTiming = async (timing) => {
    if (window.confirm("Are you sure you want to delete this timing?")) {
      try {
        await deleteAdminTiming(timing.recommendation_id);
        loadTimings(selectedBusinessType, activeFormatForTiming);
      } catch (err) {
        console.error("Failed to delete timing", err);
      }
    }
  };

  const getFormatName = (slug) => {
    const f = formats.find(f => f.slug === slug);
    return f ? f.name : slug;
  };

  return (
    <>
     

      <h1 className="aaf-title">Ad Formats</h1>
      <p className="aaf-sub">Manage available ad formats and pricing</p>

      {loading ? (
        <div className="aaf-loader">
          <Loader2 size={36} className="aaf-loader-icon" />
          <span>Loading formats...</span>
        </div>
      ) : (
        <div className="aaf-table-container">
          <table className="aaf-table">
            <thead>
              <tr>
                <th className="aaf-th">Format</th>
                <th className="aaf-th">Standard Credits</th>
                <th className="aaf-th">Prime Credits</th>
                <th className="aaf-th">Weekly Limit</th>
                <th className="aaf-th">Performance</th>
                <th className="aaf-th">Status</th>
                <th className="aaf-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((format) => (
                <tr key={format.format_id} className="aaf-tr">
                  <td className="aaf-td aaf-td-bold">{format.name}</td>
                  <td className="aaf-td">{format.standard_credits}</td>
                  <td className="aaf-td">{format.prime_credits}</td>
                  <td className="aaf-td">{format.weekly_limit}</td>
                  <td className="aaf-td">{format.estimated_performance || "-"}</td>
                  <td className="aaf-td">
                    <label className="aaf-switch">
                      <input 
                        type="checkbox" 
                        checked={format.is_active}
                        onChange={() => handleToggleClick(format)}
                      />
                      <span className="aaf-slider"></span>
                    </label>
                  </td>
                  <td className="aaf-td">
                    <button className="aaf-btn-edit" onClick={() => handleEditClick(format)} style={{ marginRight: '8px' }}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="aaf-btn-edit" onClick={() => handleManageTimingClick(format)}>
                      <CalendarClock size={14} /> Manage Timings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* Format Edit Modal */}
      {editDialog && (
        <div className="aaf-modal-overlay">
          <div className="aaf-modal">
            <h2 className="aaf-modal-title">Edit {currentFormat?.name}</h2>
            <form onSubmit={handleSave}>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Weekly Limit</label>
                <input 
                  type="number" 
                  className="aaf-form-input" 
                  value={formData.weekly_limit}
                  onChange={e => setFormData({...formData, weekly_limit: e.target.value})}
                  required
                />
              </div>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Standard Credits</label>
                <input 
                  type="number" 
                  className="aaf-form-input" 
                  value={formData.standard_credits}
                  onChange={e => setFormData({...formData, standard_credits: e.target.value})}
                  required
                />
              </div>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Prime Credits</label>
                <input 
                  type="number" 
                  className="aaf-form-input" 
                  value={formData.prime_credits}
                  onChange={e => setFormData({...formData, prime_credits: e.target.value})}
                  required
                />
              </div>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Estimated Performance</label>
                <input 
                  type="text" 
                  className="aaf-form-input" 
                  value={formData.estimated_performance}
                  onChange={e => setFormData({...formData, estimated_performance: e.target.value})}
                />
              </div>
              <div className="aaf-modal-actions">
                <button type="button" className="aaf-btn-cancel" onClick={handleClose}>Cancel</button>
                <button type="submit" className="aaf-btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Timing Drawer Modal */}
      {timingDrawerOpen && activeFormatForTiming && (
        <div className="aaf-modal-overlay">
          <div className="aaf-modal aaf-modal-large">
            <button className="aaf-modal-close" onClick={handleCloseTimingDrawer}><X size={20} /></button>
            <h2 className="aaf-modal-title">Manage Smart Timings: {activeFormatForTiming.name}</h2>
            
            <div className="st-header-flex-row" style={{ marginBottom: '20px' }}>
              <select 
                className="st-business-select"
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
              >
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button className="st-add-btn" onClick={handleAddTiming}>
                <Plus size={16} /> Add Timing
              </button>
            </div>

            <div className="aaf-table-container">
              {timingsLoading ? (
                <div className="aaf-loader">
                  <Loader2 size={36} className="aaf-loader-icon" />
                  <span>Loading timings...</span>
                </div>
              ) : timings.length === 0 ? (
                <div className="aaf-loader">
                  <span>No timings configured for {selectedBusinessType} in {activeFormatForTiming.name}.</span>
                </div>
              ) : (
                <table className="aaf-table">
                  <thead>
                    <tr>
                      <th className="aaf-th">Best Day</th>
                      <th className="aaf-th">Prime Time</th>
                      <th className="aaf-th">Engagement Window</th>
                      <th className="aaf-th">Status</th>
                      <th className="aaf-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timings.map((timing) => (
                      <tr key={timing.recommendation_id} className="aaf-tr">
                        <td className="aaf-td">{timing.best_day}</td>
                        <td className="aaf-td">{timing.prime_time_start} - {timing.prime_time_end}</td>
                        <td className="aaf-td">{timing.high_engagement_window}</td>
                        <td className="aaf-td">
                          <span className={`st-chip ${timing.is_active ? 'active' : 'inactive'}`}>
                            {timing.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="aaf-td st-actions-cell">
                          <label className="aaf-switch aaf-switch-scaled">
                            <input 
                              type="checkbox" 
                              checked={timing.is_active}
                              onChange={() => handleToggleTimingStatus(timing)}
                            />
                            <span className="aaf-slider"></span>
                          </label>
                          <button className="st-btn-action" onClick={() => handleEditTiming(timing)} title="Edit Timing">
                            <Edit2 size={16} />
                          </button>
                          <button className="st-btn-action delete" onClick={() => handleDeleteTiming(timing)} title="Delete Timing">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Timing Add/Edit Modal */}
      {timingFormOpen && (
        <div className="aaf-modal-overlay high-z">
          <div className="aaf-modal">
            <h2 className="aaf-modal-title">{editingTiming ? "Edit Timing" : "Add Timing"}</h2>
            <form onSubmit={handleSaveTiming}>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Ad Format</label>
                <input 
                  type="text" 
                  className="aaf-form-input" 
                  value={activeFormatForTiming?.name}
                  disabled
                />
              </div>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Best Day</label>
                <input 
                  type="text" 
                  className="aaf-form-input" 
                  value={timingFormData.best_day}
                  onChange={e => setTimingFormData({...timingFormData, best_day: e.target.value})}
                  required
                />
              </div>
              <div className="aaf-form-group-flex">
                <div className="aaf-form-group-flex-item">
                  <label className="aaf-form-label">Prime Start Time</label>
                  <input 
                    type="text" 
                    className="aaf-form-input" 
                    value={timingFormData.prime_time_start}
                    onChange={e => setTimingFormData({...timingFormData, prime_time_start: e.target.value})}
                    placeholder="e.g. 12 PM"
                    required
                  />
                </div>
                <div className="aaf-form-group-flex-item">
                  <label className="aaf-form-label">Prime End Time</label>
                  <input 
                    type="text" 
                    className="aaf-form-input" 
                    value={timingFormData.prime_time_end}
                    onChange={e => setTimingFormData({...timingFormData, prime_time_end: e.target.value})}
                    placeholder="e.g. 3 PM"
                    required
                  />
                </div>
              </div>
              <div className="aaf-form-group">
                <label className="aaf-form-label">High Engagement Window</label>
                <input 
                  type="text" 
                  className="aaf-form-input" 
                  value={timingFormData.high_engagement_window}
                  onChange={e => setTimingFormData({...timingFormData, high_engagement_window: e.target.value})}
                  required
                />
              </div>
              <div className="aaf-form-group-flex-center">
                <label className="aaf-form-label">Active</label>
                <label className="aaf-switch">
                  <input 
                    type="checkbox" 
                    checked={timingFormData.is_active}
                    onChange={e => setTimingFormData({...timingFormData, is_active: e.target.checked})}
                  />
                  <span className="aaf-slider"></span>
                </label>
              </div>
              <div className="aaf-modal-actions">
                <button type="button" className="aaf-btn-cancel" onClick={() => setTimingFormOpen(false)}>Cancel</button>
                <button type="submit" className="aaf-btn-save">Save Timing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmToggleFormat}
        title={confirmToggleFormat?.is_active ? "Deactivate Format?" : "Activate Format?"}
        message={
          confirmToggleFormat?.is_active
            ? `Are you sure you want to deactivate ${confirmToggleFormat?.name || "this format"}? Brands will no longer be able to purchase this format.`
            : `Are you sure you want to activate ${confirmToggleFormat?.name || "this format"}? It will instantly become available for brands to purchase.`
        }
        confirmLabel={confirmToggleFormat?.is_active ? "Deactivate" : "Activate"}
        danger={confirmToggleFormat?.is_active}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmToggleFormat(null)}
        loading={isToggling}
      />
    </>
  );
}
