import { useState, useEffect } from "react";
import { Loader2, Edit2 } from "lucide-react";
import { fetchAdminAdFormats, updateAdFormat, updateAdFormatStatus } from "../../services/adFormats";
import ConfirmModal from "../../components/admin/ConfirmModal";

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
        }
        .aaf-modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: white; }
        
        .aaf-form-group { margin-bottom: 16px; }
        .aaf-form-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .aaf-form-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 10px 12px; border-radius: 8px; font-family: inherit; font-size: 14px;
        }
        .aaf-form-input:focus { outline: none; border-color: #7c3aed; }
        
        .aaf-modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .aaf-btn-cancel {
          background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
        }
        .aaf-btn-save {
          background: #7c3aed; border: none; color: white;
          padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
        }
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
