import "./ConfirmModal.css";

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
  );
}
