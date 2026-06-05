import { useState, useEffect } from "react";
import { Loader2, Edit2, Clock, X, Plus, Trash2 } from "lucide-react";
import { fetchAdminAdFormats, updateAdFormat, updateAdFormatStatus } from "../../services/adFormats";
import { 
  fetchAdminTimingsByBusiness,
  createAdminTiming, 
  updateAdminTiming, 
  toggleAdminTiming, 
  deleteAdminTiming 
} from "../../services/smartTiming";
import ConfirmModal from "../../components/admin/ConfirmModal";

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

  const loadTimings = async (businessType) => {
    try {
      setTimingsLoading(true);
      const res = await fetchAdminTimingsByBusiness(businessType);
      setTimings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimingsLoading(false);
    }
  };

  useEffect(() => {
    loadTimings(selectedBusinessType);
  }, [selectedBusinessType]);

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
      format_slug: formats.length > 0 ? formats[0].slug : "",
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
      loadTimings(selectedBusinessType);
    } catch (err) {
      console.error("Failed to save timing", err);
    }
  };

  const handleToggleTimingStatus = async (timing) => {
    try {
      await toggleAdminTiming(timing.recommendation_id, !timing.is_active);
      loadTimings(selectedBusinessType);
    } catch (err) {
      console.error("Failed to toggle timing", err);
    }
  };

  const handleDeleteTiming = async (timing) => {
    if (window.confirm("Are you sure you want to delete this timing?")) {
      try {
        await deleteAdminTiming(timing.recommendation_id);
        loadTimings(selectedBusinessType);
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
      <style>{`
        .aaf-title {
          font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .aaf-sub {
          font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 28px;
        }
        .aaf-loader {
          text-align: center; padding: 64px 24px; color: rgba(255,255,255,0.45);
        }
        
        .aaf-table-container {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .aaf-table {
          width: 100%; border-collapse: collapse; text-align: left;
        }
        .aaf-th {
          padding: 16px; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.4); text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .aaf-td {
          padding: 16px; font-size: 14px; color: rgba(255,255,255,0.85);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .aaf-tr:last-child .aaf-td { border-bottom: none; }
        .aaf-tr:hover { background: rgba(255,255,255,0.02); }

        .aaf-btn-edit {
          background: rgba(255,255,255,0.08); border: none;
          color: white; padding: 6px 12px; border-radius: 8px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .aaf-btn-edit:hover { background: rgba(255,255,255,0.15); }

        /* Toggle Switch */
        .aaf-switch {
          position: relative; display: inline-block; width: 36px; height: 20px;
        }
        .aaf-switch input { opacity: 0; width: 0; height: 0; }
        .aaf-slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1); transition: .3s; border-radius: 20px;
        }
        .aaf-slider:before {
          position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px;
          background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .aaf-slider { background-color: #7c3aed; }
        input:checked + .aaf-slider:before { transform: translateX(16px); }

        /* Modal */
        .aaf-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .aaf-modal {
          background: #1e1b4b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; width: 400px; max-width: 90%; padding: 24px;
          max-height: 90vh; overflow-y: auto;
        }
        .aaf-modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: white; }
        
        .aaf-form-group { margin-bottom: 16px; }
        .aaf-form-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .aaf-form-input, .aaf-form-select {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 10px 12px; border-radius: 8px; font-family: inherit; font-size: 14px;
        }
        .aaf-form-input:focus, .aaf-form-select:focus { outline: none; border-color: #7c3aed; }
        .aaf-form-select option { background: #1e1b4b; }
        
        .aaf-modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .aaf-btn-cancel {
          background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
        }
        .aaf-btn-save {
          background: #7c3aed; border: none; color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
        }

        /* Smart Timing Section */
        .st-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .st-business-select {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 10px 16px; border-radius: 8px; font-family: inherit; font-size: 14px;
          cursor: pointer; min-width: 200px;
        }
        .st-business-select:focus { outline: none; border-color: #7c3aed; }
        .st-business-select option { background: #1e1b4b; }
        
        .st-add-btn {
          background: #7c3aed; border: none; color: white;
          padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
          display: flex; align-items: center; gap: 8px; font-size: 14px;
        }
        .st-add-btn:hover { background: #6d28d9; }

        .st-chip {
          padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;
          display: inline-block;
        }
        .st-chip.active { background: rgba(52, 211, 153, 0.15); color: #34d399; }
        .st-chip.inactive { background: rgba(248, 113, 113, 0.15); color: #f87171; }
        
        .st-btn-action {
          background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,0.6);
          padding: 4px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center;
          transition: 0.2s;
        }
        .st-btn-action:hover { background: rgba(255,255,255,0.1); color: white; }
        .st-btn-action.delete:hover { background: rgba(248, 113, 113, 0.15); color: #f87171; }
      `}</style>

      <h1 className="aaf-title">Ad Formats</h1>
      <p className="aaf-sub">Manage available ad formats and pricing</p>

      {loading ? (
        <div className="aaf-loader">
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
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
                  <td className="aaf-td" style={{ fontWeight: 600 }}>{format.name}</td>
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
                    <button className="aaf-btn-edit" onClick={() => handleEditClick(format)}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Smart Timing Recommendations Section */}
      <div className="st-header">
        <div>
          <h2 className="aaf-title" style={{ fontSize: '20px' }}>Smart Timing Recommendations</h2>
          <p className="aaf-sub" style={{ marginBottom: 0 }}>Configure optimal posting times for different business types</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
      </div>

      <div className="aaf-table-container">
        {timingsLoading ? (
          <div className="aaf-loader">
            <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
            <span>Loading timings...</span>
          </div>
        ) : timings.length === 0 ? (
          <div className="aaf-loader">
            <span>No timings configured for {selectedBusinessType}.</span>
          </div>
        ) : (
          <table className="aaf-table">
            <thead>
              <tr>
                <th className="aaf-th">Format</th>
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
                  <td className="aaf-td" style={{ fontWeight: 600 }}>{getFormatName(timing.format_slug)}</td>
                  <td className="aaf-td">{timing.best_day}</td>
                  <td className="aaf-td">{timing.prime_time_start} - {timing.prime_time_end}</td>
                  <td className="aaf-td">{timing.high_engagement_window}</td>
                  <td className="aaf-td">
                    <span className={`st-chip ${timing.is_active ? 'active' : 'inactive'}`}>
                      {timing.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="aaf-td" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <label className="aaf-switch" style={{ transform: "scale(0.8)", margin: 0 }}>
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

      {/* Smart Timing Add/Edit Modal */}
      {timingFormOpen && (
        <div className="aaf-modal-overlay" style={{ zIndex: 110 }}>
          <div className="aaf-modal">
            <h2 className="aaf-modal-title">{editingTiming ? "Edit Timing" : "Add Timing"}</h2>
            <form onSubmit={handleSaveTiming}>
              <div className="aaf-form-group">
                <label className="aaf-form-label">Ad Format</label>
                <select 
                  className="aaf-form-select"
                  value={timingFormData.format_slug}
                  onChange={e => setTimingFormData({...timingFormData, format_slug: e.target.value})}
                  required
                  disabled={!!editingTiming} // Don't allow changing format when editing
                >
                  <option value="" disabled>Select a format</option>
                  {formats.map(f => (
                    <option key={f.format_id} value={f.slug}>{f.name}</option>
                  ))}
                </select>
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="aaf-form-group" style={{ flex: 1 }}>
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
                <div className="aaf-form-group" style={{ flex: 1 }}>
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
              <div className="aaf-form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <label className="aaf-form-label" style={{ marginBottom: 0 }}>Active</label>
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
