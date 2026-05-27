import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchBrandTransactions } from "../../services/packages";

const PAGE_SIZE = 8;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchBrandTransactions({
        page,
        page_size: PAGE_SIZE,
      });
      setTransactions(response.data.transactions || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style>{`
        .tx-wrap { margin-top: 10px; }
        .tx-title-row { margin-bottom: 20px; }
        .tx-title { font-size: 20px; font-weight: 700; color: #fff; }
        .tx-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        
        .tx-table-wrap {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; overflow: hidden; backdrop-filter: blur(16px);
        }
        .tx-table {
          width: 100%; border-collapse: collapse; table-layout: fixed;
        }
        .tx-table th {
          text-align: left; padding: 16px 20px; font-size: 13px;
          color: rgba(255,255,255,0.45); font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .tx-col-ref { width: 22%; }
        .tx-col-pkg { width: 22%; }
        .tx-col-amt { width: 14%; }
        .tx-col-cr  { width: 14%; }
        .tx-col-date { width: 16%; }
        .tx-col-status { width: 12%; }

        .tx-table td {
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85); font-size: 13.5px;
          vertical-align: middle; overflow: hidden; text-overflow: ellipsis;
        }
        .tx-table tr:last-child td { border-bottom: none; }
        
        .tx-ref { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.5); }
        .tx-pkg { font-weight: 600; color: #fff; }

        .tx-status-badge {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.02em;
        }
        .tx-status-badge.success {
          background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
        }
        .tx-status-badge.failed {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }
        .tx-status-badge.pending {
          background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25);
          color: #fbbf24;
        }

        .tx-empty, .tx-error, .tx-loading {
          padding: 48px 24px; text-align: center;
          color: rgba(255,255,255,0.45); font-size: 14px;
        }
        .tx-error { color: #f87171; }
        .tx-retry-btn {
          margin-top: 12px; height: 38px; padding: 0 16px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06); color: white; border-radius: 10px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif; font-size: 13px;
        }

        .tx-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; background: rgba(0,0,0,0.15);
        }
        .tx-count { font-size: 12.5px; color: rgba(255,255,255,0.4); }
        .tx-pagination { display: flex; gap: 8px; align-items: center; }
        .tx-page-btn {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .tx-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .tx-page-btn:not(:disabled):hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tx-page-num { font-size: 12.5px; color: rgba(255,255,255,0.5); min-width: 60px; text-align: center; }
      `}</style>

      <div className="tx-wrap">
        <div className="tx-title-row">
          <h3 className="tx-title">Transaction History</h3>
          <p className="tx-subtitle">Purchase transactions ledger and receipt history</p>
        </div>

        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th className="tx-col-ref">Reference Code</th>
                <th className="tx-col-pkg">Package</th>
                <th className="tx-col-amt">Amount</th>
                <th className="tx-col-cr">Credits Added</th>
                <th className="tx-col-date">Date</th>
                <th className="tx-col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-loading">
                      <Loader2
                        size={20}
                        style={{
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 8px",
                          display: "block",
                        }}
                      />
                      Loading transaction history...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-error">
                      {error}
                      <br />
                      <button type="button" className="tx-retry-btn" onClick={loadTransactions}>
                        <RotateCcw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-empty">No transaction history found.</div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.transaction_id}>
                    <td>
                      <span className="tx-ref" title={txn.transaction_reference}>
                        {txn.transaction_reference || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="tx-pkg">{txn.package_name || "Custom Package"}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                        Expires: {formatDate(txn.expiry_date)}
                      </div>
                    </td>
                    <td>₹{parseFloat(txn.amount).toLocaleString("en-IN")}</td>
                    <td>+{txn.credits_added} credits</td>
                    <td>{formatDate(txn.purchase_date)}</td>
                    <td>
                      <span className={`tx-status-badge ${txn.payment_status?.toLowerCase() || "success"}`}>
                        {txn.payment_status || "Success"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && !error && transactions.length > 0 && (
            <div className="tx-footer">
              <span className="tx-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="tx-pagination">
                <button
                  type="button"
                  className="tx-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="tx-page-num">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="tx-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
