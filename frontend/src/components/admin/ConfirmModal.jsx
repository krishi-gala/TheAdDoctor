export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) {
  if (!open) return null;

  return (
    <>
      <style>{`
        .cm-overlay {
          position: fixed; inset: 0; z-index: 110;
          background: rgba(15, 10, 40, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
        }
        .cm-box {
          width: 100%; max-width: 400px; padding: 28px;
          background: rgba(30, 20, 70, 0.95);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; text-align: center;
        }
        .cm-title { font-size: 18px; font-weight: 700; color: #fff; }
        .cm-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 12px 0 24px; }
        .cm-actions { display: flex; gap: 12px; }
        .cm-cancel {
          flex: 1; height: 42px; border-radius: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); font-weight: 600; cursor: pointer;
        }
        .cm-confirm {
          flex: 1; height: 42px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-weight: 600; cursor: pointer;
        }
        .cm-confirm.danger { background: rgba(239,68,68,0.85); }
        .cm-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="cm-overlay" onClick={onCancel}>
        <div className="cm-box" onClick={(e) => e.stopPropagation()}>
          <div className="cm-title">{title}</div>
          <p className="cm-text">{message}</p>
          <div className="cm-actions">
            <button type="button" className="cm-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`cm-confirm${danger ? " danger" : ""}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Please wait..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
